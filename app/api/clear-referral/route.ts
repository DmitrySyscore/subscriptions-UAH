import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(req: Request) {
  try {
    const { customerId } = await req.json();

    if (!customerId || typeof customerId !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid customerId' }, { status: 400 });
    }

    await stripe.customers.update(customerId, {
      metadata: {
        referred_customer_ids: '',
        referral_count: '',
        referral_bonus: '',
      },
    });

    // Another request for metadata logging data
    const updatedCustomer = await stripe.customers.retrieve(customerId);
    console.log ('The metadata has been successfully updated');
    console.log(`New metadata for ${customerId}:`, updatedCustomer['metadata']);

    return NextResponse.json({ success: true });
  } catch (error: any) {
      console.error('Error clearing referral metadata:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
