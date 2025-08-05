import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(req: NextRequest) {
  try {
    const { customerId, priceId, referralId } = await req.json();

    if (!customerId || !priceId) {
      return NextResponse.json({ error: 'Missing customerId or priceId' }, { status: 400 });
    }

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata: {
        referralId: referralId || '',
      },
    });

    return NextResponse.json({ subscription });
  } catch (err: any) {
    console.error('Failed to create subscription:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
