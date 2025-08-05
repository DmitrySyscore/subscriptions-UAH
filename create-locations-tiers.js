// connecting to Stripe SDK (CommonJS)
const stripe = require('stripe')('sk_test_51RTG4kRj81djxho2tLeIeTsF51cTsVzFCmuz7xUHpbLS3bYl9cqt8694fiYyDc64apo8500NOQvmmXWBRVG7Jxww00Oqx6hni5');

async function createTiers() {
  try {
    //EU teirs
    // GOLD
    const goldProductEU = await stripe.products.create({
      name: 'EU SLA Gold',
      images: ['https://i.imgur.com/Z4htIzG.png'], 
      metadata: {
        location: 'EU',
        type: 'SLA',
        tier: 'Gold'
      }
    });

    await stripe.prices.create({
      product: goldProductEU.id,
      unit_amount: 3000,
      currency: 'eur',
      recurring: { interval: 'month' },
      lookup_key: 'eu_sla_gold'
    });

    // SILVER
    const silverProductEU = await stripe.products.create({
      name: 'EU SLA Silver',
      images: ['https://i.imgur.com/IXWvMkY.png'],
      metadata: {
        location: 'EU',
        type: 'SLA',
        tier: 'Silver'
      }
    });

    await stripe.prices.create({
      product: silverProductEU.id,
      unit_amount: 2000,
      currency: 'eur',
      recurring: { interval: 'month' },
      lookup_key: 'eu_sla_silver'
    });

    // BRONZE
    const bronzeProductEU = await stripe.products.create({
      name: 'EU SLA Bronze',
      images: ['https://i.imgur.com/1SU6TID.png'],
      metadata: {
        location: 'EU',
        type: 'SLA',
        tier: 'Bronze'
      }
    });

    await stripe.prices.create({
      product: bronzeProductEU.id,
      unit_amount: 1000,
      currency: 'eur',
      recurring: { interval: 'month' },
      lookup_key: 'eu_sla_bronze'
    });

    //US tiers
    // GOLD
    const goldProductUS = await stripe.products.create({
      name: 'US SLA Gold',
      images: ['https://i.imgur.com/Z4htIzG.png'], 
      metadata: {
        location: 'US',
        type: 'SLA',
        tier: 'Gold'
      }
    });

    await stripe.prices.create({
      product: goldProductUS.id,
      unit_amount: 3500,
      currency: 'usd',
      recurring: { interval: 'month' },
      lookup_key: 'us_sla_gold'
    });

    // SILVER
    const silverProductUS = await stripe.products.create({
      name: 'US SLA Silver',
      images: ['https://i.imgur.com/IXWvMkY.png'],
      metadata: {
        location: 'US',
        type: 'SLA',
        tier: 'Silver'
      }
    });

    await stripe.prices.create({
      product: silverProductUS.id,
      unit_amount: 2500,
      currency: 'usd',
      recurring: { interval: 'month' },
      lookup_key: 'us_sla_silver'
    });

    // BRONZE
    const bronzeProductUS = await stripe.products.create({
      name: 'US SLA Bronze',
      images: ['https://i.imgur.com/1SU6TID.png'],
      metadata: {
        location: 'US',
        type: 'SLA',
        tier: 'Bronze'
      }
    });

    await stripe.prices.create({
      product: bronzeProductUS.id,
      unit_amount: 1500,
      currency: 'usd',
      recurring: { interval: 'month' },
      lookup_key: 'us_sla_bronze'
    });

    console.log('✅ All SLA tiers created successfully');
  } catch (error) {
    console.error('❌ Error creating SLA tiers:', error.message);
  }
}

createTiers();
