import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(req: Request) {
  const { 
    ref, 
    location, 
    productType, 
    slaTier, 
    includeSubscription, 
    customerId, 
    paymentMethodId 
  } = await req.json();
  
  console.log('create-subscription-direct received:', { 
    ref, 
    location, 
    productType, 
    slaTier, 
    includeSubscription, 
    customerId, 
    paymentMethodId 
  });

  if (!customerId || !paymentMethodId) {
    return NextResponse.json(
      { error: 'Customer ID and Payment Method ID are required' }, 
      { status: 400 }
    );
  }

  try {
    const lineItems: any[] = [];

    // Add subscription if selected
    if (includeSubscription) {
      lineItems.push({
        price: 'price_1RTdrCRj81djxho2lPgusn15', // Subscription price ID
        quantity: 1,
      });
    }

    // Add SLA product if selected
    if ((productType === 'SLA' || productType === 'Both') && slaTier && location) {
      const productIdMap: Record<string, Record<string, string>> = {
        EU: {
          Bronze: 'prod_Sj8nABZluozK4K',
          Silver: 'prod_Sj8njJI9kmb4di',
          Gold: 'prod_Sj8nnl3iCNdqGM',
        },
        US: {
          Bronze: 'prod_Sj8LxTwLUfzk5t',
          Silver: 'prod_Sj8Lk6eprBEQ3k',
          Gold: 'prod_Sj8Lt4NDbZzI5i',
        },
      };

      const productId = productIdMap[location]?.[slaTier];
      
      if (productId) {
        const prices = await stripe.prices.list({
          product: productId,
          active: true,
        });

        if (prices.data.length > 0) {
          lineItems.push({
            price: prices.data[0].id,
            quantity: 1,
          });
        } else {
          console.error(`Price not found for product: ${productId}`);
        }
      } else {
        console.error(`Product ID not found for location: ${location}, tier: ${slaTier}`);
      }
    }

    if (lineItems.length === 0) {
      return NextResponse.json({ error: 'No products selected' }, { status: 400 });
    }

    // Create subscription directly using saved payment method
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: lineItems,
      default_payment_method: paymentMethodId,
      metadata: {
        ...(ref && { referralCode: ref }),
        ...(location && { location }),
        ...(productType && { productType }),
        ...(slaTier && { slaTier }),
      },
    });

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      status: subscription.status
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' }, 
      { status: 500 }
    );
  }
}