import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import Stripe from 'stripe';
import path from 'path';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper for reading raw body
async function buffer(readable: ReadableStream<Uint8Array>) {
  const reader = readable.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  return Buffer.concat(chunks);
}

// The clearReferralMetadata helper function, which clears fields related to referral bonuses in Stripe client metadata
async function clearReferralMetadata(customerId: string) {
  try {
    await stripe.customers.update(customerId, {
      metadata: {
        referred_customer_ids: '',
        referral_count: '',
        referral_bonus: '',
      },
    });
    
    console.log(`Referral metadata cleared for customer ${customerId}`);
  } catch (error) {
    console.error(`Failed to clear referral metadata for ${customerId}:`, error);
  }
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return new NextResponse('Missing stripe-signature header', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await buffer(req.body!);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Immediately acknowledge the webhook to prevent timeouts
  if (event.type === 'invoice.paid') {
    // Process asynchronously to avoid webhook timeout
    processInvoicePaid(event.data.object as Stripe.Invoice);
  } else if (event.type === 'checkout.session.completed') {
    // Handle checkout completion for immediate PDF generation trigger
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status === 'paid') {
      console.log('-> stripe-> webhook-> Checkout session completed with payment');
      // Additional processing can be added here if needed
    }
  }

  return new NextResponse('Webhook received', { status: 200 });
}

// Separate async function to handle invoice processing
async function processInvoicePaid(invoice: Stripe.Invoice) {
  try {
    console.log('-> stripe-> webhook-> Invoice paid:', invoice.id);

    const customerId = typeof invoice.customer === 'string'
      ? invoice.customer
      : invoice.customer?.id;

    if (!customerId) {
      console.warn('No customer ID found on invoice');
      return;
    }

    // === 1. Saving a PDF invoice ===
    try {
      console.log(`-> stripe-> webhook-> processInvoicePaid-> triggering PDF invoice generation for customer ${customerId}`);
      
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/invoice/${customerId}/pdf`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/pdf',
          },
        }
      );
      
      console.log(`-> stripe-> webhook-> processInvoicePaid-> PDF generation response: ${res.status}`);

      if (res.ok) {
        const pdfBuffer = await res.arrayBuffer();
        const filename = `invoice-${invoice.number || invoice.id}.pdf`;
        const filePath = path.join(process.cwd(), 'public/generated-pdfs', filename);

        await mkdir(path.dirname(filePath), { recursive: true });
        await writeFile(filePath, Buffer.from(pdfBuffer));

        console.log(`PDF invoice successfully saved: ${filePath}`);
        
        // Log file size for verification
        const stats = await import('fs/promises').then(fs => fs.stat(filePath));
        console.log(`PDF file size: ${stats.size} bytes`);
      } else {
        const errorText = await res.text();
        console.error(`Failed to fetch PDF invoice: ${res.status} - ${errorText}`);
      }
    } catch (err) {
      console.error('Error saving PDF invoice:', err);
    }

    // === 2. Referral Bonus Logic ===
    try {
      console.log(`-> stripe-> webhook-> Referral Bonus Logic start`);

      const subscriptionId =
        invoice['subscription'] && typeof invoice['subscription'] === 'object'
          ? invoice['subscription']['id']
          : invoice['subscription'];

      if (!subscriptionId) {
        console.warn('No subscription ID found on invoice');
        return;
      }

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const referralCode = subscription.metadata?.['referralCode'];

      if (!referralCode || referralCode.trim() === '') {
        console.log('No referral code found — no bonus applied.');
        return;
      }

      // Check if this is a subscription or SLA purchase
      const productType = subscription.metadata?.['productType'];
      const slaTier = subscription.metadata?.['slaTier'];
      
      console.log(`Processing referral bonus for ${productType} purchase, SLA tier: ${slaTier}`);

      // Getting the inviting customer via referralCode (customer.id)
      const referrerCustomer = await stripe.customers.retrieve(referralCode);
      if (!referrerCustomer || referrerCustomer.deleted) {
        console.warn(`Referrer customer not found or deleted: ${referralCode}`);
        return;
      }

      // Getting a subscription of inviting customer (referrer).
      const referrerSubs = await stripe.subscriptions.list({
        customer: referralCode,
        status: 'active',
        limit: 1,
      });

      if (referrerSubs.data.length === 0) {
        console.warn(`No active subscription found for referrer ${referralCode}`);
        return;
      }

      const referrerSub = referrerSubs.data[0];

      // Always add bonus for each referral, regardless of whether customer was referred before
      const referredCustomerId = subscription.customer;
      
      // Track all referral events for logging purposes
      const referredListRaw = (referrerCustomer['metadata'] && referrerCustomer['metadata']['referred_customer_ids']) || '';
      const referredIds = referredListRaw ? referredListRaw.split(',') : [];
      
      // Always add the customer ID to track all referral events
      referredIds.push(referredCustomerId);
      
      await stripe.customers.update(referralCode, {
        metadata: {
          referred_customer_ids: referredIds.join(','),
        },
      });

      console.log(`Added referral bonus: ${referredCustomerId} referred by ${referralCode} (total referrals: ${referredIds.length})`);

      // Calculation of renewal date: current_period_end + 1 month for this referral
      const currentPeriodEnd =
        referrerSub['current_period_end'] ||
        referrerSub.items?.data?.[0]?.['current_period_end'] ||
        referrerSub['trial_end'];

      if (!currentPeriodEnd || isNaN(currentPeriodEnd)) {
        console.warn(
          `Invalid or missing current_period_end (or fallback) for subscription ${referrerSub.id}`
        );
        return;
      }

      // Check if subscription already has pause_collection with resumes_at
      let existingResumesAt = currentPeriodEnd;
      if (referrerSub.pause_collection?.resumes_at) {
        existingResumesAt = referrerSub.pause_collection.resumes_at;
        console.log(`Existing bonus time found, resumes_at: ${new Date(existingResumesAt * 1000).toISOString()}`);
      }

      // Always add 1 month bonus for each referral, even for repeat customers
      const additionalMonths = 1;
      const newResumesAt = existingResumesAt + additionalMonths * 30 * 24 * 60 * 60; // 1 month for this referral
      //const newResumesAt = existingResumesAt + additionalMonths * 60; // test: 1 minute per referral

      await stripe.subscriptions.update(referrerSub.id, {
        pause_collection: {
          behavior: 'mark_uncollectible',
          resumes_at: newResumesAt,
        },
      });

      console.log(
        `Referrer ${referralCode} received bonus: subscription extended by ${referredIds.length} month(s), new resume date: ${new Date(
          newResumesAt * 1000
        ).toISOString()}`
      );
    } catch (err) {
      console.error('Referral reward error:', err);
    }
  } catch (error) {
    console.error('Error processing invoice:', error);
  }
}
