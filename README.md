# Subscription Management Platform

A comprehensive Next.js-based subscription management platform with Stripe integration, referral system, and multi-tier SLA support.

## 🚀 Features

### Core Functionality
- **Subscription Management**: Handle various product types including subscriptions, SLA tiers, product presentation services, and market agent services
- **Referral System**: Automated referral tracking with bonus month rewards for successful referrals
- **Multi-Region Support**: Location-based pricing and product availability across North America and Europe
- **Payment Processing**: Secure Stripe integration for subscription management and payment processing
- **Invoice Generation**: Automated PDF invoice generation and download functionality

### Product Types
1. **Subscription Service**: Core subscription product
2. **SLA Tiers**: 
   - Silver: Basic support with standard response times
   - Gold: Standard support with good response times
   - Platinum: Premium support with fastest response times
3. **Product Presentation Service**: Specialized service for product showcasing
4. **Market Agent**: Market representation services

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14 with TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Payment Processing**: Stripe
- **Styling**: Tailwind CSS

### Database Schema ([`prisma/schema.prisma`](prisma/schema.prisma:1))
```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  name          String?
  stripeId      String?  @unique
  
  // Referral system
  referredById  String?
  referredBy    User?    @relation("Referrals", fields: [referredById], references: [id])
  referrals     User[]   @relation("Referrals")
  
  // Referral tracking
  referralCount Int      @default(0)
  freeMonths    Int      @default(0)
  
  createdAt     DateTime @default(now())
}
```

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── check-signature/route.ts      # Signature verification
│   │   ├── clear-referral/route.ts       # Referral cleanup
│   │   ├── create-checkout-session/route.ts # Stripe checkout creation
│   │   ├── invoice/[customerId]/pdf/route.ts # PDF invoice generation
│   │   └── subscription/route.ts         # Subscription management
│   ├── checkout/page.tsx                 # Checkout page
│   └── page.tsx                          # Main landing page
├── prisma/
│   └── schema.prisma                     # Database schema
└── README.md
```

## 🔧 API Endpoints

### Checkout Session Creation ([`app/api/create-checkout-session/route.ts`](app/api/create-checkout-session/route.ts:1))
Creates Stripe checkout sessions with proper product mapping based on location and tier.

**POST** `/api/create-checkout-session`
```json
{
  "ref": "referral-code",
  "location": "Europe_Germany",
  "productType": "SLA",
  "slaTier": "Platinum",
  "customerId": "cus_xxx",
  "paymentMethodId": "pm_xxx"
}
```

### Invoice Generation ([`app/api/invoice/[customerId]/pdf/route.ts`](app/api/invoice/[customerId]/pdf/route.ts:1))
Generates PDF invoices for customers.

**GET** `/api/invoice/[customerId]/pdf`

### Subscription Management ([`app/api/subscription/route.ts`](app/api/subscription/route.ts:1))
Creates new subscriptions with referral tracking.

**POST** `/api/subscription`
```json
{
  "customerId": "cus_xxx",
  "priceId": "price_xxx",
  "referralId": "optional-referral-id"
}
```

### Referral System ([`app/api/clear-referral/route.ts`](app/api/clear-referral/route.ts:1))
Manages referral metadata and cleanup.

**POST** `/api/clear-referral`
```json
{
  "customerId": "cus_xxx"
}
```

## 🌍 Location-Based Pricing

### SLA Pricing Structure
| Tier | Europe (Germany) | North America (USA) |
|------|------------------|---------------------|
| Silver | €10/month | $15/month |
| Gold | €20/month | $25/month |
| Platinum | €30/month | $35/month |

### Product Mapping
- **Europe_Germany**: Uses EU pricing and products
- **North America_USA**: Uses US pricing and products

## 🎁 Referral System

### How It Works
1. **Referral Tracking**: Each successful referral is tracked via Stripe customer metadata
2. **Bonus Calculation**: Referrers receive 1 free month for each successful referral
3. **Subscription Extension**: Bonus months extend the subscription pause period
4. **Unlimited Rewards**: No limit on referral bonuses - each referral adds 1 month

### Implementation Details
- Referrals are tracked in `referred_customer_ids` metadata field
- Bonus months are applied by extending the `pause_collection.resumes_at` date
- System handles both new and existing customers

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Stripe account with configured products and prices

### Installation

1. **Clone the repository**
```bash
git clone [repository-url]
cd subscription-platform
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
Create `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/subscription_db"
STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_PUBLISHABLE_KEY="pk_test_xxx"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

4. **Database setup**
```bash
npx prisma generate
npx prisma db push
```

5. **Stripe configuration**
- Create products and prices in Stripe Dashboard
- Update product ID mappings in [`app/api/create-checkout-session/route.ts`](app/api/create-checkout-session/route.ts:17)

6. **Start development server**
```bash
npm run dev
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key for API calls | Yes |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key for frontend | Yes |
| `NEXT_PUBLIC_API_URL` | Base URL for the application | Yes |

## 🧪 Testing

### Manual Testing Checklist
- [ ] Create checkout sessions for each product type
- [ ] Test referral system with multiple referrals
- [ ] Verify PDF invoice generation
- [ ] Test location-based pricing
- [ ] Verify SLA tier selection and pricing
- [ ] Test subscription creation and management

### Test Data Setup
1. Create test customers in Stripe
2. Set up test products with appropriate prices
3. Configure location-based product mappings

## 📊 Monitoring & Logging

### Key Metrics to Monitor
- Subscription creation rate
- Referral conversion rate
- Payment success/failure rates
- Invoice generation errors

### Logging Locations
- API route handlers include detailed console logging
- Stripe webhook events are logged for debugging
- Referral system tracks all bonus applications

## 🔧 Troubleshooting

### Common Issues

1. **Product ID not found**
   - Check product mappings in [`app/api/create-checkout-session/route.ts`](app/api/create-checkout-session/route.ts:17)
   - Verify products exist in Stripe dashboard

2. **Referral bonus not applied**
   - Check Stripe customer metadata for `referred_customer_ids`
   - Verify subscription has active status

3. **PDF generation fails**
   - Ensure customer has valid subscriptions
   - Check Stripe API permissions

4. **Location-based pricing issues**
   - Verify location format matches expected patterns
   - Check product ID mappings for each region

## 📝 Development Notes

### Code Style
- TypeScript for type safety
- Consistent error handling with try-catch blocks
- Detailed logging for debugging
- Modular API route structure

### Future Enhancements
- [ ] Admin dashboard for referral tracking
- [ ] Email notifications for referral bonuses
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Mobile app integration

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.