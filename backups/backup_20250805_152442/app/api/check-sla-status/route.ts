import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

// SLA product IDs from create-subscription-direct/route.ts
const SLA_PRODUCTS = [
  // EU products
  'prod_Sj8nABZluozK4K', // Bronze EU
  'prod_Sj8njJI9kmb4di', // Silver EU
  'prod_Sj8nnl3iCNdqGM', // Gold EU
  // US products
  'prod_Sj8LxTwLUfzk5t', // Bronze US
  'prod_Sj8Lk6eprBEQ3k', // Silver US
  'prod_Sj8Lt4NDbZzI5i', // Gold US
];

function isValidProduct(product: any): product is Stripe.Product {
  return product && typeof product === 'object' && !product.deleted && 'id' in product;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
  }

  try {
    // Find customer by userId (Stripe customer ID)
    let customer;
    try {
      customer = await stripe.customers.retrieve(userId);
    } catch (error) {
      return NextResponse.json({
        hasActiveSLA: false,
        message: 'No customer found with this userId',
      });
    }

    if (!customer || typeof customer === 'string' || customer.deleted) {
      return NextResponse.json({
        hasActiveSLA: false,
        message: 'No customer found with this userId',
      });
    }

    // Check for active subscriptions with SLA products
    const subscriptions = await stripe.subscriptions.list({
      customer: userId,
      status: 'active',
      expand: ['data.items.data.price'],
    });

    // Check each subscription for SLA products
    let slaSubscription = null;
    let slaItem = null;
    let productId = '';
    let productName = '';

    for (const subscription of subscriptions.data) {
      for (const item of subscription.items.data) {
        const productIdFromPrice = typeof item.price.product === 'string'
          ? item.price.product
          : item.price.product?.id;

        if (productIdFromPrice && SLA_PRODUCTS.includes(productIdFromPrice)) {
          slaSubscription = subscription;
          slaItem = item;
          productId = productIdFromPrice;
          
          // Get product details
          try {
            const product = await stripe.products.retrieve(productIdFromPrice);
            productName = product.name || 'Unknown';
          } catch (error) {
            productName = 'Unknown';
          }
          
          break;
        }
      }
      if (slaSubscription) break;
    }

    if (!slaSubscription || !slaItem) {
      return NextResponse.json({
        hasActiveSLA: false,
        customerId: userId,
        message: 'No active SLA subscriptions found',
      });
    }

    return NextResponse.json({
      hasActiveSLA: true,
      customerId: userId,
      subscriptionId: slaSubscription.id,
      productId: productId,
      productName: productName,
      slaTier: getSLATierFromProduct(productId),
      location: getLocationFromProduct(productId),
    });

  } catch (error) {
    console.error('Error checking SLA status:', error);
    return NextResponse.json({ error: 'Failed to check SLA status' }, { status: 500 });
  }
}

function getSLATierFromProduct(productId: string): string {
  const tierMap: Record<string, string> = {
    'prod_Sj8nABZluozK4K': 'Bronze',
    'prod_Sj8njJI9kmb4di': 'Silver',
    'prod_Sj8nnl3iCNdqGM': 'Gold',
    'prod_Sj8LxTwLUfzk5t': 'Bronze',
    'prod_Sj8Lk6eprBEQ3k': 'Silver',
    'prod_Sj8Lt4NDbZzI5i': 'Gold',
  };
  return tierMap[productId] || 'Unknown';
}

function getLocationFromProduct(productId: string): string {
  const locationMap: Record<string, string> = {
    'prod_Sj8nABZluozK4K': 'EU',
    'prod_Sj8njJI9kmb4di': 'EU',
    'prod_Sj8nnl3iCNdqGM': 'EU',
    'prod_Sj8LxTwLUfzk5t': 'US',
    'prod_Sj8Lk6eprBEQ3k': 'US',
    'prod_Sj8Lt4NDbZzI5i': 'US',
  };
  return locationMap[productId] || 'Unknown';
}