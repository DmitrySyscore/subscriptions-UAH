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
    customerId,
    paymentMethodId
  } = await req.json();
  
  console.log('create-subscription-direct received:', {
    ref,
    location,
    productType,
    slaTier,
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

    // Only add products based on the selected product type
    if (productType === 'SLA' && slaTier && location) {
      // Extract city name from location format "Continent_Country_City"
      const cityName = location.split('_')[2] || location;
      console.log('Extracted city name:', cityName, 'from location:', location);
      
      const productIdMap: Record<string, Record<string, string>> = {
        'Washington': {
          Bronze: 'prod_Sj8LxTwLUfzk5t',
          Silver: 'prod_Sj8Lk6eprBEQ3k',
          Gold: 'prod_Sj8Lt4NDbZzI5i',
        },
        'Dallas': {
          Bronze: 'prod_Sj8LxTwLUfzk5t',
          Silver: 'prod_Sj8Lk6eprBEQ3k',
          Gold: 'prod_Sj8Lt4NDbZzI5i',
        },
        'New York': {
          Bronze: 'prod_Sj8LxTwLUfzk5t',
          Silver: 'prod_Sj8Lk6eprBEQ3k',
          Gold: 'prod_Sj8Lt4NDbZzI5i',
        },
        'Berlin': {
          Bronze: 'prod_Sj8nABZluozK4K',
          Silver: 'prod_Sj8njJI9kmb4di',
          Gold: 'prod_Sj8nnl3iCNdqGM',
        },
        'Dresden': {
          Bronze: 'prod_Sj8nABZluozK4K',
          Silver: 'prod_Sj8njJI9kmb4di',
          Gold: 'prod_Sj8nnl3iCNdqGM',
        },
      };

      const productId = productIdMap[cityName]?.[slaTier];
      
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
    } else if (productType === 'Subscription' || productType === 'Product presentation service' || productType === 'Market Agent') {
      // Map subscription and product presentation service products based on location
      const subscriptionProductMap: Record<string, string> = {
              'Europe_Germany': 'prod_SewWUEbVwl7dHS',
              'North America_USA': 'prod_Sqd44yg7CGgQsY',
            };
      
            const productPresentationServiceMap: Record<string, string> = {
              'Europe_Germany': 'prod_StDZUp65e8VNOO',
              'North America_USA': 'prod_StDKJvCffE3Nmj',
            };
      
            const marketAgentProductMap: Record<string, string> = {
              'Europe_Germany': 'prod_SuLPx96qTJOODr',
              'North America_USA': 'prod_SuLPE2lEtex0fC',
            };
      
            let productMap: Record<string, string>;
            if (productType === 'Subscription') {
              productMap = subscriptionProductMap;
            } else if (productType === 'Product presentation service') {
              productMap = productPresentationServiceMap;
            } else if (productType === 'Market Agent') {
              productMap = marketAgentProductMap;
            } else {
              return NextResponse.json({ error: 'Invalid product type' }, { status: 400 });
            }

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
          console.error(`Price not found for ${productType} product: ${productId}`);
        }
      } else {
        console.error(`${productType} product ID not found for location: ${location}`);
      }
    }

    if (lineItems.length === 0) {
      return NextResponse.json({ error: 'No products selected' }, { status: 400 });
    }

    // Check for location restriction before creating subscription
    // Get customer's existing subscriptions
    const existingSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      expand: ['data.items.data.price'],
    });

    // Determine the continent of the new subscription
    let newContinent: string | null = null;
    if (location) {
      newContinent = location.split('_')[0];
    }

    // Check for conflicting continent subscriptions across all service types
    if (existingSubscriptions.data.length > 0 && newContinent) {
      for (const subscription of existingSubscriptions.data) {
        for (const item of subscription.items.data) {
          // Get product info to determine continent
          const product = await stripe.products.retrieve(item.price.product as string);
          const productName = product.name.toLowerCase();
          
          let existingContinent: string | null = null;
          
          // Check product name for continent indicators
          if (productName.includes('berlin') || productName.includes('dresden') || productName.includes('europe')) {
            existingContinent = 'Europe';
          } else if (productName.includes('washington') || productName.includes('dallas') || productName.includes('new york') || productName.includes('usa') || productName.includes('north america')) {
            existingContinent = 'North America';
          }
          
          // Also check subscription metadata for location
          if (!existingContinent && subscription.metadata?.location) {
            existingContinent = subscription.metadata.location.split('_')[0];
          }

          if (existingContinent && existingContinent !== newContinent) {
            return NextResponse.json(
              {
                error: `You already have active subscriptions in ${existingContinent}. You cannot purchase services in a different continent (${newContinent}).`
              },
              { status: 400 }
            );
          }
        }
      }
    }

    // Check for duplicate services at the same location
    for (const subscription of existingSubscriptions.data) {
      const subscriptionLocation = subscription.metadata?.location;
      const subscriptionProductType = subscription.metadata?.productType;
      
      if (subscriptionLocation === location) {
        // Check for duplicate SLA tiers at same location
        if (productType === 'SLA' && subscriptionProductType === 'SLA') {
          const existingTier = subscription.metadata?.slaTier;
          if (existingTier === slaTier) {
            return NextResponse.json(
              { error: `You already have a ${slaTier} SLA subscription at this location.` },
              { status: 400 }
            );
          }
          
          // Check for tier upgrades
          const tierLevels: Record<string, number> = {
            'Bronze': 1,
            'Silver': 2,
            'Gold': 3
          };
          
          if (existingTier && slaTier && tierLevels[slaTier] <= tierLevels[existingTier]) {
            return NextResponse.json(
              { error: `You already have a ${existingTier} SLA at this location. You can only upgrade to a higher tier.` },
              { status: 400 }
            );
          }
        }
        
        // Check for duplicate subscription services
        if (productType === 'Subscription' && subscriptionProductType === 'Subscription') {
          return NextResponse.json(
            { error: `You already have a subscription service at this location.` },
            { status: 400 }
          );
        }
        
        // Check for duplicate product presentations
        if (productType === 'Product presentation service' && subscriptionProductType === 'Product presentation service') {
          return NextResponse.json(
            { error: `You already have a product presentation service at this location.` },
            { status: 400 }
          );
        }
        
        // Check for duplicate market agent services
        if (productType === 'Market Agent' && subscriptionProductType === 'Market Agent') {
          return NextResponse.json(
            { error: `You already have a market agent service at this location.` },
            { status: 400 }
          );
        }
      }
    }

    // Validate location format for subscription, product presentation, and market agent services
    if (productType === 'Subscription' || productType === 'Product presentation service' || productType === 'Market Agent') {
      if (!location) {
        return NextResponse.json(
          { error: 'Location is required for this service type' },
          { status: 400 }
        );
      }

      // Validate location format (should be Continent_Country)
      const locationParts = location.split('_');
      if (locationParts.length < 2) {
        return NextResponse.json(
          { error: 'Invalid location format. Expected format: Continent_Country' },
          { status: 400 }
        );
      }

      const [continent, country] = locationParts;
      
      // Validate supported continents and countries
      const validLocations: Record<string, string[]> = {
        'Europe': ['Germany'],
        'North America': ['USA']
      };

      if (!validLocations[continent] || !validLocations[continent].includes(country)) {
        return NextResponse.json(
          { error: `Unsupported location: ${location}. Supported locations: Europe_Germany, North America_USA` },
          { status: 400 }
        );
      }

      // Check if the location exists in the respective product map
      let productMap: Record<string, string>;
      if (productType === 'Subscription') {
        productMap = {
          'Europe_Germany': 'prod_SewWUEbVwl7dHS',
          'North America_USA': 'prod_Sqd44yg7CGgQsY',
        };
      } else if (productType === 'Product presentation service') {
        productMap = {
          'Europe_Germany': 'prod_StDZUp65e8VNOO',
          'North America_USA': 'prod_StDKJvCffE3Nmj',
        };
      } else {
        productMap = {
          'Europe_Germany': 'prod_SuLPx96qTJOODr',
          'North America_USA': 'prod_SuLPE2lEtex0fC',
        };
      }

      if (!productMap[location]) {
        return NextResponse.json(
          { error: `No product available for location: ${location}` },
          { status: 400 }
        );
      }
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