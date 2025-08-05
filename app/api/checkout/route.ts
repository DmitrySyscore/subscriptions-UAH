import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

console.log('app\api\checkout\route.ts');
export async function POST(req: NextRequest) {
  let referralCode = '';
  
  try {
    // safely parse the body
    const body = await req.json();
    referralCode = body?.referralCode || '';
  } catch (err) {
    // If the body is missing or invalid, we do not fall.
    console.warn('No JSON body provided or invalid JSON');
  }

  const priceId = process.env.STRIPE_PRICE_ID;

  if (!priceId) {
    return NextResponse.json({ error: 'Price ID is not set in environment variables' }, { status: 500 });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
      metadata: {
        referralCode,
      },   
    });

    console.log('referralCode', referralCode);


    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe session creation error:', error);
    return NextResponse.json({ error: 'Failed to create Stripe session' }, { status: 500 });
  }
}
