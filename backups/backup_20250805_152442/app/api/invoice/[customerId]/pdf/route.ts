import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function GET(req: NextRequest, { params }: { params: { customerId: string } }) {
  const { customerId } = await params;
  
  try {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      status: 'paid',
      limit: 1,
      expand: ['data.customer', 'data.lines.data.price'],
    });

    console.log('CustomerID who is making a purchase:', customerId);
    if (!invoices.data.length) {
      return new NextResponse('No paid invoices found.', { status: 404 });
    }

    const invoice = invoices.data[0];

    const logoSVG = await readFile(path.join(process.cwd(), 'public/uah-logo-gradient.svg'), 'utf8');
    const htmlTemplate = await readFile(path.join(process.cwd(), 'templates/invoice-template.html'), 'utf8');

    const customDescriptions: Record<string, string> = {
      'price_1RTdrCRj81djxho2lPgusn15': 'Basic EU Market Subscription',
      'price_1ReZxiRj81djxho2Y2eKJrjX': 'Surcharge on products inquiries',
      'price_1ReZwRRj81djxho245KNRdtH': 'Direct standard surcharge',
      'price_1ReZv3Rj81djxho2URzgonU0': 'Surcharge on negotiated pricing',
      'price_1RebRBRj81djxho2QGzi8dvB': 'Direct high volume surcharge',
    };

    const customDescriptionsDetails: Record<string, string> = {
      'price_1RTdrCRj81djxho2lPgusn15': 'standard fixed rate',
      'price_1ReZxiRj81djxho2Y2eKJrjX': '(€0.0000833 EUR per unit / month)',
      'price_1ReZwRRj81djxho245KNRdtH': '(€0.0000667 EUR per unit / month)',
      'price_1ReZv3Rj81djxho2URzgonU0': '(€0.0000333 EUR per unit / month)',
      'price_1RebRBRj81djxho2QGzi8dvB': '(€0.00005 EUR per unit / month)',
    };

    const data = {
      invoice: {
        logo_svg: logoSVG,
        number: invoice.number,
        date_issued: new Date(invoice.created * 1000).toLocaleDateString('en-GB', { dateStyle: 'long' }),
        due_date: new Date(invoice.created * 1000).toLocaleDateString('en-GB', { dateStyle: 'long' }),
        total: (invoice.amount_due / 100).toFixed(2),
        hosted_invoice_url: invoice.hosted_invoice_url,
        customer_name:
            typeof invoice.customer === 'object' && 'name' in invoice.customer && invoice.customer.name
                ? invoice.customer.name
                : invoice.customer_name || 'N/A',

        customer_email: 
            typeof invoice.customer === 'object' && 'email' in invoice.customer && invoice.customer.email
                ? invoice.customer.email
                : invoice.customer_email || 'N/A',

        seller_name: "UAH Marketplace Test",
        seller_address: "02796 Kurort Jonsdorf",
        seller_country: "Germany",
        seller_email: "sandbox@accessible.stripe.com",
        lines: invoice.lines.data.map((line: any) => {
          const priceId = line.pricing.price_details.price;
          const customDescription = customDescriptions[priceId];
          const customDescriptionDetails = customDescriptionsDetails[priceId];
  
          return {
            description: customDescription ?? line.description,
            unit_price: (line.quantity ? (line.amount / line.quantity / 100) : (line.amount / 100)).toFixed(2),
            total: (line.amount / 100).toFixed(2),
            
            description_details: customDescriptionDetails ?? '',

            period: line.period
              ? `${new Date(line.period.start * 1000).toLocaleDateString('en-GB', { dateStyle: 'medium' })} – ${new Date(line.period.end * 1000).toLocaleDateString('en-GB', { dateStyle: 'medium' })}`
              : '',
          };
        }),
      },
    };

    const template = Handlebars.compile(htmlTemplate);
    const html = template(data);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '30mm', bottom: '20mm', left: '20mm', right: '20mm' },
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.number}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('PDF generation error:', error);
    return new NextResponse(`Error: ${error.message}`, { status: 500 });
  }
}
