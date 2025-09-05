import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

// SLA product IDs from create-subscription-direct/route.ts
const SLA_PRODUCTS = [
  // EU products
  'prod_Sj8nABZluozK4K', // Silver EU
  'prod_Sj8njJI9kmb4di', // Gold EU
  'prod_Sj8nnl3iCNdqGM', // Platinum EU
  // US products
  'prod_Sj8LxTwLUfzk5t', // Silver US
  'prod_Sj8Lk6eprBEQ3k', // Gold US
  'prod_Sj8Lt4NDbZzI5i', // Platinum US
];

// Subscription and Product presentation service product IDs
const SUBSCRIPTION_PRODUCTS = [
  'prod_SewWUEbVwl7dHS', // Europe_Germany
  'prod_Sqd44yg7CGgQsY', // North America_USA
];

const PRODUCT_PRESENTATION_SERVICE_PRODUCTS = [
  'prod_StDZUp65e8VNOO', // Europe_Germany
  'prod_StDKJvCffE3Nmj', // North America_USA
];

const MARKET_AGENT_PRODUCTS = [
  'prod_SuLPx96qTJOODr', // Europe_Germany
  'prod_SuLPE2lEtex0fC', // North America_USA
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
        hasActiveSubscriptions: false,
        message: 'No customer found with this userId',
      });
    }

    if (!customer || typeof customer === 'string' || customer.deleted) {
      return NextResponse.json({
        hasActiveSubscriptions: false,
        message: 'No customer found with this userId',
      });
    }

    // Check for all active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: userId,
      status: 'active',
      expand: ['data.items.data.price'],
    });

    // Collect all active subscriptions categorized by type
    const activeSLAs = [];
    const activeSubscriptions = [];
    const activeProductPresentations = [];
    const activeMarketAgents = [];

    for (const subscription of subscriptions.data) {
      for (const item of subscription.items.data) {
        const productIdFromPrice = typeof item.price.product === 'string'
          ? item.price.product
          : item.price.product?.id;

        if (!productIdFromPrice) continue;

        let productName = 'Unknown';
        try {
          const product = await stripe.products.retrieve(productIdFromPrice);
          productName = product.name || 'Unknown';
        } catch (error) {
          productName = 'Unknown';
        }

        const subscriptionData = {
          subscriptionId: subscription.id,
          productId: productIdFromPrice,
          productName: productName,
          location: subscription.metadata?.location || subscription.metadata?.fullLocation || 'Unknown',
          created: subscription.created,
          currentPeriodStart: (subscription as any).current_period_start,
          currentPeriodEnd: (subscription as any).current_period_end,
        };

        // Categorize by product type
        if (SLA_PRODUCTS.includes(productIdFromPrice)) {
          activeSLAs.push({
            ...subscriptionData,
            slaTier: getSLATierFromProduct(productIdFromPrice),
          });
        } else if (SUBSCRIPTION_PRODUCTS.includes(productIdFromPrice)) {
          activeSubscriptions.push({
            ...subscriptionData,
            serviceType: 'Subscription',
          });
        } else if (PRODUCT_PRESENTATION_SERVICE_PRODUCTS.includes(productIdFromPrice)) {
          activeProductPresentations.push({
            ...subscriptionData,
            serviceType: 'Product Presentation Service',
          });
        } else if (MARKET_AGENT_PRODUCTS.includes(productIdFromPrice)) {
          activeMarketAgents.push({
            ...subscriptionData,
            serviceType: 'Market Agent',
          });
        }
      }
    }

    return NextResponse.json({
      hasActiveSubscriptions: subscriptions.data.length > 0,
      customerId: userId,
      activeSLAs,
      activeSubscriptions,
      activeProductPresentations,
      activeMarketAgents,
      totalActiveSubscriptions: subscriptions.data.length,
    });

  } catch (error) {
    console.error('Error checking all subscriptions:', error);
    return NextResponse.json({ error: 'Failed to check subscription status' }, { status: 500 });
  }
}

function getSLATierFromProduct(productId: string): string {
  const tierMap: Record<string, string> = {
    'prod_Sj8nABZluozK4K': 'Silver',
    'prod_Sj8njJI9kmb4di': 'Gold',
    'prod_Sj8nnl3iCNdqGM': 'Platinum',
    'prod_Sj8LxTwLUfzk5t': 'Silver',
    'prod_Sj8Lk6eprBEQ3k': 'Gold',
    'prod_Sj8Lt4NDbZzI5i': 'Platinum',
  };
  return tierMap[productId] || 'Unknown';
}