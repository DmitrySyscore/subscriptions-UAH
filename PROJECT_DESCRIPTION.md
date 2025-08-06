# UAH Subscriptions Platform - Project Overview

## Project Summary

The **UAH Subscriptions Platform** is a comprehensive subscription management system built with Next.js, TypeScript, and PostgreSQL. It provides a complete solution for managing subscription-based services with SLA tiers, referral programs, digital signatures, and automated billing workflows.

## 🎯 Core Purpose

This platform enables businesses to sell subscription services and SLA (Service Level Agreement) tiers with integrated payment processing, referral bonuses, and document signing workflows. It supports both new customer registrations and existing customer upgrades/downgrades.

## 🏗️ Technology Stack

- **Frontend**: Next.js 15.3.4 with React 19.1.0
- **Backend**: Next.js API Routes (Serverless Functions)
- **Database**: PostgreSQL with Prisma ORM
- **Payment Processing**: Stripe (v18.3.0)
- **Digital Signatures**: YouSign API Integration
- **PDF Generation**: Puppeteer with Handlebars templates
- **Language**: TypeScript
- **Deployment**: Vercel-ready

## 🚀 Key Features

### 1. Subscription Management
- **Multi-tier SLA system**: Bronze, Silver, Gold tiers
- **Geographic pricing**: Separate pricing for EU and US markets
- **Flexible product combinations**: Subscription-only, SLA-only, or both
- **Upgrade/downgrade support**: Seamless tier transitions

### 2. Referral Program
- **Automated referral tracking**: Uses Stripe customer metadata
- **Bonus system**: 1 free month per successful referral
- **Cascading bonuses**: Multiple referrals extend subscription periods
- **Referral validation**: Prevents abuse and duplicate rewards

### 3. Digital Signature Workflow
- **YouSign integration**: Legal document signing before payment
- **Multi-step process**: Signature → Payment → Subscription activation
- **Status monitoring**: Real-time signature status checking
- **Document templates**: Standardized Terms and Conditions

### 4. Automated Billing & Invoicing
- **PDF invoice generation**: Automatic creation after successful payments
- **Custom invoice templates**: Branded with company logo and details
- **Invoice storage**: Persistent PDF files in public directory
- **Webhook processing**: Real-time payment and subscription updates

### 5. Customer Management
- **Stripe customer integration**: Full customer lifecycle management
- **Payment method management**: Saved cards and payment preferences
- **Subscription status tracking**: Active, paused, cancelled states
- **Customer portal**: Self-service subscription management

## 📁 Project Structure

```
subscriptions-UAH/
├── app/                          # Next.js App Router
│   ├── (routes)/                 # Route groups
│   │   └── pricing/              # Pricing page
│   ├── api/                      # API routes
│   │   ├── checkout/             # Stripe checkout sessions
│   │   ├── stripe/               # Stripe webhooks
│   │   ├── invoice/              # PDF invoice generation
│   │   ├── yousign/              # Digital signature APIs
│   │   └── referral/             # Referral program APIs
│   ├── checkout/                 # Checkout flow pages
│   ├── signature-status/         # Signature monitoring
│   └── success/                  # Success pages
├── prisma/                       # Database schema and migrations
├── templates/                    # PDF invoice templates
├── public/                       # Static assets and generated PDFs
├── backups/                      # Automated backup system
└── lib/                          # Shared utilities
```

## 🔧 API Endpoints

### Core APIs
- `POST /api/create-checkout-session` - Create Stripe checkout sessions
- `POST /api/stripe/webhook` - Process Stripe webhooks
- `GET /api/invoice/[customerId]/pdf` - Generate customer invoices
- `POST /api/yousign/start-signing` - Initiate document signing
- `GET /api/check-sla-status` - Check customer's SLA status
- `POST /api/cancel-subscription` - Cancel existing subscriptions

### Referral System
- `GET /api/user-by-stripe-id` - Get user details by Stripe ID
- `POST /api/clear-referral` - Clear referral metadata (admin)
- `GET /api/referral/[userid]` - Get referral statistics

## 💰 Pricing Structure

### SLA Tiers
| Tier | EU Price | US Price | Features |
|------|----------|----------|----------|
| Bronze | €10/month | $15/month | Basic support, standard response |
| Silver | €20/month | $25/month | Standard support, good response |
| Gold | €30/month | $35/month | Premium support, fastest response |

### Subscription
- **Base Subscription**: €29/month (fixed rate)
- **Combined packages**: Subscription + SLA tier pricing

## 🔄 Business Workflows

### 1. New Customer Registration
1. **Homepage selection**: Choose location, product type, SLA tier
2. **Referral validation**: Optional referral code processing
3. **Document signing**: YouSign workflow for Terms & Conditions
4. **Payment processing**: Stripe checkout session
5. **Subscription activation**: Automatic setup and welcome

### 2. Existing Customer Upgrade
1. **SLA status check**: Verify current subscription
2. **Upgrade confirmation**: User confirms tier change
3. **Cancellation**: Current subscription cancelled
4. **New subscription**: Higher tier activated
5. **Pro-rating**: Automatic billing adjustments

### 3. Referral Bonus Processing
1. **Payment detection**: Webhook triggers on successful payment
2. **Referral validation**: Check for valid referral code
3. **Bonus calculation**: Add 1 month per referral
4. **Subscription extension**: Pause collection with extended end date
5. **Tracking update**: Update referral metadata

## 📊 Database Schema

### User Model
- `id`: UUID primary key
- `email`: Unique email address
- `name`: Customer name
- `stripeId`: Stripe customer ID (unique)
- `referredById`: Referrer relationship
- `referrals`: List of referred users
- `referralCount`: Number of successful referrals
- `freeMonths`: Accumulated bonus months

## 🛡️ Security Features

- **Webhook signature verification**: Prevents spoofed requests
- **Environment variable protection**: Sensitive keys in .env.local
- **Input validation**: Comprehensive request validation
- **Rate limiting**: Built-in API protection
- **Secure payment processing**: PCI-compliant via Stripe

## 🔄 Backup & Recovery

### Automated Backup System
- **PowerShell scripts**: `backup.ps1`, `restore.ps1`, `detect_changes.ps1`
- **Selective backup**: Excludes node_modules and build artifacts
- **Version control**: Timestamped backup directories
- **Zip compression**: Space-efficient storage
- **One-click restore**: Complete project recovery

### Backup Contents
- **Source code**: All application files
- **Database schema**: Prisma migrations and schema
- **Configuration**: Environment files and settings
- **Templates**: Invoice and document templates
- **Assets**: Static files and resources

## 🚀 Development & Deployment

### Local Development
```bash
# Install dependencies
npm install

# Set up environment
cp .env.local.example .env.local
# Edit .env.local with your keys

# Database setup
npx prisma migrate dev
npx prisma generate

# Start development server
npm run dev
```

### Environment Variables Required
```bash
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
YOUSIGN_API_KEY=your_yousign_key
NEXT_PUBLIC_API_URL=https://your-domain.com
```

## 📈 Monitoring & Analytics

- **Webhook logging**: Detailed payment and subscription events
- **Error tracking**: Comprehensive error handling and logging
- **Referral analytics**: Track referral program effectiveness
- **Invoice tracking**: Monitor PDF generation and delivery
- **Performance metrics**: API response times and success rates

## 🎯 Future Enhancements

- **Customer portal**: Self-service subscription management
- **Email notifications**: Automated billing and renewal reminders
- **Usage analytics**: Track feature adoption and usage patterns
- **Multi-language support**: Internationalization for global markets
- **Advanced reporting**: Detailed business intelligence dashboards

## 📞 Support & Maintenance

- **Automated testing**: Unit and integration test suites
- **Health checks**: API endpoint monitoring
- **Backup verification**: Regular backup integrity checks
- **Dependency updates**: Automated security patches
- **Documentation**: Comprehensive API and user documentation

---

*This platform represents a production-ready subscription management system with enterprise-grade features for billing, customer management, and referral programs.*