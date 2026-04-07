# BizSaathi API Backend

> Complete AI-powered backend for Indian small business owners built with Next.js, Supabase, and Anthropic

## Quick Start

### 1. Clone and Setup

```bash
git clone <repository>
cd biz-saathi
npm install
```

### 2. Configure Environment

```bash
cp .env.local.example .env.local
# Edit .env.local with your API keys
```

### 3. Setup Database

- Create Supabase project
- Run `supabase-schema.sql` in Supabase SQL editor
- Get your credentials and add to `.env.local`

### 4. Configure Services

**Anthropic**: Get API key from [console.anthropic.com](https://console.anthropic.com)

**Supabase**: Create project at [supabase.com](https://supabase.com)

**Upstash Redis**: Create database at [upstash.com](https://upstash.com)

**Razorpay**: Get credentials at [razorpay.com](https://razorpay.com)

### 5. Run

```bash
npm run dev
# Open http://localhost:3000
```

## API Quick Reference

### AI Tools (Guest & Authenticated)

```bash
# WhatsApp Message Writer
POST /api/ai/whatsapp-writer
{
  "userInput": "I want to sell my handmade soaps",
  "language": "en"
}

# Social Media Poster Maker
POST /api/ai/poster-maker
{
  "userInput": "Diwali sale announcement",
  "language": "hi"
}

# Profit Optimization Advisor
POST /api/ai/profit-advisor
{
  "userInput": "I run a small bakery in Delhi"
}

# GST Compliance Helper
POST /api/ai/gst-helper
{
  "userInput": "What's the GST rate for restaurant services?"
}

# Customer Review Replier
POST /api/ai/review-replier
{
  "userInput": "Negative review: Poor service and high prices"
}
```

### Authentication

```bash
# Sign Up
POST /api/auth/signup
{
  "email": "user@example.com",
  "password": "secure123"
}

# Sign In
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "secure123"
}
```

### User Dashboard

```bash
# Get Remaining Credits
GET /api/user/credits
Header: Authorization: Bearer YOUR_TOKEN

# Get Usage History
GET /api/user/history
Header: Authorization: Bearer YOUR_TOKEN
```

### Payments

```bash
# Create Upgrade Order
POST /api/payments/create-order
Header: Authorization: Bearer YOUR_TOKEN
{
  "planType": "pro_monthly"  // or "pro_yearly"
}

# Webhook (Razorpay sends this)
POST /api/payments/webhook
```

## Architecture

- **Frontend**: Next.js 14 with TypeScript
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **AI**: Anthropic Claude 3.5 Sonnet
- **Authentication**: Supabase Auth
- **Rate Limiting**: Upstash Redis
- **Payments**: Razorpay
- **Hosting**: Vercel

## Features

✅ 5 AI-powered business tools
✅ User authentication
✅ Free (10 credits/day) & Pro plans
✅ Guest rate limiting (3/day)
✅ Payment integration
✅ Usage history tracking
✅ Daily credit reset
✅ Row-level security
✅ TypeScript throughout
✅ Error handling

## Credit System

- **Free Plan**: 10 credits per day
- **Pro Plan**: Unlimited credits
- **Guests**: 3 API calls per day (rate limited by IP)
- Daily reset: 00:00 UTC (via Vercel Cron)

## Environment Variables

```
# AI
ANTHROPIC_API_KEY=sk-ant-...

# Database
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Rate Limiting
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Payments
RAZORPAY_KEY_ID=rzp_...
RAZORPAY_KEY_SECRET=...

# Cron Jobs
CRON_SECRET=random_secret_key
```

## Database Schema

### users
- id (UUID) - User ID from Auth
- email (VARCHAR)
- plan (VARCHAR) - 'free' or 'pro'
- credits_remaining (INTEGER)
- created_at (TIMESTAMP)

### tool_usage
- id (UUID)
- user_id (UUID, nullable)
- tool_name (VARCHAR)
- output (TEXT)
- created_at (TIMESTAMP)

### orders
- id (UUID)
- user_id (UUID)
- razorpay_order_id (VARCHAR)
- amount (INTEGER)
- status (VARCHAR) - 'created'/'completed'/'failed'
- created_at (TIMESTAMP)

## Deployment

### Deploy to Vercel

```bash
vercel deploy
# Set environment variables in Vercel dashboard
```

### Set Up Cron

- Configured in `vercel.json`
- Daily credit reset at 00:00 UTC
- Requires `CRON_SECRET` in environment

### Configure Webhooks

1. Razorpay Dashboard → Settings → Webhooks
2. Add: `https://yourdomain.vercel.app/api/payments/webhook`
3. Select: `payment.authorized`, `payment.captured`, `payment.failed`

## Development

```bash
npm run dev      # Dev server
npm run build    # Build
npm run start    # Production
npm run lint     # Linting
npm run type-check # Type check
```

## File Structure

```
lib/
  ├── ai.ts              # Anthropic integration
  ├── supabase.ts        # Database client
  ├── ratelimit.ts       # Rate limiting
  ├── credits.ts         # Credit system
  ├── auth.ts            # JWT verification
  ├── types.ts           # TypeScript types
  ├── constants.ts       # App constants
  └── api-helpers.ts     # Response helpers

app/api/
  ├── ai/
  │   ├── whatsapp-writer/
  │   ├── poster-maker/
  │   ├── profit-advisor/
  │   ├── gst-helper/
  │   └── review-replier/
  ├── auth/
  │   ├── signup/
  │   └── login/
  ├── user/
  │   ├── credits/
  │   └── history/
  ├── payments/
  │   ├── create-order/
  │   └── webhook/
  └── cron/
      └── reset-credits/
```

## Pricing

- **Free**: ₹0 - 10 credits/day
- **Pro Monthly**: ₹299/month - Unlimited
- **Pro Yearly**: ₹2999/year - Unlimited

## Support

- [GitHub Issues](https://github.com/your-repo/issues)
- [Anthropic Docs](https://docs.anthropic.com)
- [Supabase Docs](https://supabase.com/docs)
- [Razorpay Docs](https://razorpay.com/docs)

## Live

**Production**: https://biz-saathi-48kl.vercel.app

## License

MIT
