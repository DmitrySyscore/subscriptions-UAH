import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const stripeId = searchParams.get('stripeId');

  if (!stripeId) {
    return NextResponse.json({ error: 'Missing stripeId' }, { status: 400 });
  }

  try {
    const customer = await stripe.customers.retrieve(stripeId);

    if ('deleted' in customer && customer.deleted) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({
  id: customer['id'],
  name: customer['name'] || null,
  email: customer['email'] || null,
});

  } catch (error) {
    console.error('Stripe API error:', error);
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 });
  }
}
