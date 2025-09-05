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

    // Collect all active SLA subscriptions
    const activeSLAs = [];
    
    for (const subscription of subscriptions.data) {
      for (const item of subscription.items.data) {
        const productIdFromPrice = typeof item.price.product === 'string'
          ? item.price.product
          : item.price.product?.id;

        if (productIdFromPrice && SLA_PRODUCTS.includes(productIdFromPrice)) {
          let productName = 'Unknown';
          try {
            const product = await stripe.products.retrieve(productIdFromPrice);
            productName = product.name || 'Unknown';
          } catch (error) {
            productName = 'Unknown';
          }

          // Get location from subscription metadata
          const location = subscription.metadata?.location ||
                          subscription.metadata?.fullLocation ||
                          getLocationFromProduct(productIdFromPrice);
           
          activeSLAs.push({
            subscriptionId: subscription.id,
            productId: productIdFromPrice,
            productName: productName,
            slaTier: getSLATierFromProduct(productIdFromPrice),
            location: location,
          });
        }
      }
    }

    if (activeSLAs.length === 0) {
      return NextResponse.json({
        hasActiveSLA: false,
        customerId: userId,
        message: 'No active SLA subscriptions found',
      });
    }

    // Return all active SLAs for validation
    return NextResponse.json({
      hasActiveSLA: true,
      customerId: userId,
      activeSLAs: activeSLAs,
      // For backward compatibility, return the first one
      subscriptionId: activeSLAs[0].subscriptionId,
      productId: activeSLAs[0].productId,
      productName: activeSLAs[0].productName,
      slaTier: activeSLAs[0].slaTier,
      location: activeSLAs[0].location,
    });

  } catch (error) {
    console.error('Error checking SLA status:', error);
    return NextResponse.json({ error: 'Failed to check SLA status' }, { status: 500 });
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

function getLocationFromProduct(productId: string): string {
  const locationMap: Record<string, string> = {
    // EU products - default to Berlin for backward compatibility
    'prod_Sj8nABZluozK4K': 'Europe_Germany_Berlin',
    'prod_Sj8njJI9kmb4di': 'Europe_Germany_Berlin',
    'prod_Sj8nnl3iCNdqGM': 'Europe_Germany_Berlin',
    // US products - default to Washington for backward compatibility
    'prod_Sj8LxTwLUfzk5t': 'NorthAmerica_USA_Washington',
    'prod_Sj8Lk6eprBEQ3k': 'NorthAmerica_USA_Washington',
    'prod_Sj8Lt4NDbZzI5i': 'NorthAmerica_USA_Washington',
  };
  return locationMap[productId] || 'Unknown';
}