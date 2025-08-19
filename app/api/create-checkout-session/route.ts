import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(req: Request) {
  const { ref, location, productType, slaTier, customerId, paymentMethodId } = await req.json();
  console.log('create-checkout-session received:', { ref, location, productType, slaTier, customerId, paymentMethodId });
  
  const lineItems: any[] = [];

  // Only add products based on the selected product type
  if (productType === 'SLA' && slaTier && location) {
    // Map location and tier to actual Stripe product IDs
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

    // Handle both old and new location formats
    let region = location;
    if (location.startsWith('Europe')) {
      region = 'EU';
    } else if (location.startsWith('US')) {
      region = 'US';
    }

    const productId = productIdMap[region]?.[slaTier];
    
    if (productId) {
      // Find the active price for this product
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
  } else if (productType === 'Subscription' || productType === 'Product presentation service') {
    // Map subscription and product presentation service products based on location
    const subscriptionProductMap: Record<string, string> = {
      'Europe_Germany': 'prod_SewWUEbVwl7dHS',
      'North America_USA': 'prod_Sqd44yg7CGgQsY',
    };

    const productPresentationServiceMap: Record<string, string> = {
      'Europe_Germany': 'prod_StDZUp65e8VNOO',
      'North America_USA': 'prod_StDKJvCffE3Nmj',
    };

    const productMap = productType === 'Subscription' ? subscriptionProductMap : productPresentationServiceMap;

    let productId: string | undefined;
    
    // Handle location format variations
    if (location) {
      // First try exact match
      productId = productMap[location];
      
      // If no exact match, try to extract continent and country
      if (!productId) {
        const parts = location.split('_');
        if (parts.length >= 1) {
          const continent = parts[0];
          let country = parts[1] || '';
          
          // Handle common variations
          if (continent === 'North America' && (!country || country === '')) {
            country = 'USA';
          } else if (continent === 'Europe' && (!country || country === '')) {
            country = 'Germany';
          }
          
          const key = `${continent}_${country}`;
          productId = productMap[key];
        }
      }
    }
    
    if (productId) {
      // Find the active price for this product
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
        console.error(`Price not found for subscription product: ${productId}`);
      }
    } else {
      console.error(`Subscription product ID not found for location: ${location}`);
    }
  }

  if (lineItems.length === 0) {
    return NextResponse.json({ error: 'No products selected' }, { status: 400 });
  }

  // Check if customer has saved payment methods
  let hasSavedPaymentMethod = false;
  if (customerId) {
    try {
      const paymentMethods = await stripe.customers.listPaymentMethods(customerId, {
        type: 'card',
      });
      hasSavedPaymentMethod = paymentMethods.data.length > 0;
    } catch (error) {
      console.error('Error checking payment methods:', error);
    }
  }

  const sessionConfig: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: lineItems,
    subscription_data: {
      metadata: {
        ...(ref && { referralCode: ref }),
        ...(location && { location }),
        ...(productType && { productType }),
        ...(slaTier && { slaTier }),
      },
    },
    success_url: `${process.env.NEXT_PUBLIC_API_URL}/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_API_URL}/cancel`,
  };

  if (customerId) {
    sessionConfig.customer = customerId;
    sessionConfig.payment_method_collection = hasSavedPaymentMethod ? 'if_required' : 'always';
    sessionConfig.customer_update = {
      address: 'auto',
    };
  } else {
    sessionConfig.payment_method_collection = 'always';
  }

  const session = await stripe.checkout.sessions.create(sessionConfig);

  return NextResponse.json({ url: session.url });
}
