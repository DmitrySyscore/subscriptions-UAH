import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  const { customerId } = await params;

  if (!customerId) {
    return NextResponse.json({ error: 'Missing customerId' }, { status: 400 });
  }

  try {
    // Get customer's saved payment methods
    const paymentMethods = await stripe.customers.listPaymentMethods(customerId, {
      type: 'card',
    });

    // Format the payment methods for frontend use
    const formattedPaymentMethods = paymentMethods.data.map(pm => ({
      id: pm.id,
      type: pm.type,
      card: {
        brand: pm.card?.brand,
        last4: pm.card?.last4,
        expMonth: pm.card?.exp_month,
        expYear: pm.card?.exp_year,
        funding: pm.card?.funding,
      },
      billingDetails: {
        email: pm.billing_details?.email,
        name: pm.billing_details?.name,
        address: pm.billing_details?.address,
      },
    }));

    return NextResponse.json({ paymentMethods: formattedPaymentMethods });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}