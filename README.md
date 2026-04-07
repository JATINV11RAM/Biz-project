# BizSaathi AI Backend

Complete backend implementation for BizSaathi - AI Business Assistant for Indian Small Business Owners.

## Project Structure

```
├── lib/                          # Shared utilities
│   ├── ai.ts                     # Anthropic AI client
│   ├── supabase.ts               # Supabase client
│   ├── ratelimit.ts              # IP-based rate limiting
│   ├── credits.ts                # Credit system management
│   └── auth.ts                   # Authentication utilities
├── app/
│   ├── api/
│   │   ├── ai/                   # AI tools endpoints
│   │   │   ├── whatsapp-writer/  # WhatsApp message generator
│   │   │   ├── poster-maker/     # Social media poster creator
│   │   │   ├── profit-advisor/   # Profit optimization assistant
│   │   │   ├── gst-helper/       # GST compliance guide
│   │   │   └── review-replier/   # Review response generator
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── signup/           # User registration
│   │   │   └── login/            # User login
│   │   ├── user/                 # User data endpoints
│   │   │   ├── credits/          # Get user credits
│   │   │   └── history/          # Get tool usage history
│   │   ├── payments/             # Payment endpoints
│   │   │   ├── create-order/     # Create Razorpay order
│   │   │   └── webhook/          # Razorpay webhook handler
│   │   └── cron/                 # Scheduled jobs
│   │       └── reset-credits/    # Daily credits reset
├── middleware.ts                 # API route protection
├── supabase-schema.sql          # Database schema
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── next.config.js               # Next.js config
└── vercel.json                  # Vercel deployment config

```

## Features

### AI Tools (5 POST endpoints under `/api/ai/`)
- **WhatsApp Writer**: Generate professional WhatsApp messages
- **Poster Maker**: Create social media posters and promotional content
- **Profit Advisor**: Get profit optimization strategies
- **GST Helper**: Get GST compliance guidance
- **Review Replier**: Generate responses to customer reviews

All tools:
- Accept `{ userInput, language }` as input
- Return `{ output }` with AI-generated response
- Use Anthropic Claude with "BizSaathi AI" branding (never expose provider)
- Support guest (rate-limited) and authenticated users
- Deduct credits from free plan users, unlimited for pro

### Authentication
- Signup/Login with Supabase Auth
- JWT token-based authentication
- Automatic user profile creation on signup

### Credit System
- Free users: 10 credits/day (reset daily)
- Pro users: Unlimited credits
- Daily reset via Vercel Cron

### Rate Limiting
- Guest users: 3 requests/day (IP-based)
- Uses Upstash Redis for distributed rate limiting

### Payment Integration
- Razorpay integration for plan upgrades
- Free → Pro monthly (₹299) or yearly (₹2999)
- Webhook handling for payment confirmation

### Database
- Supabase PostgreSQL with RLS policies
- Tables: users, tool_usage, orders
- Automatic timestamps and foreign keys

## Setup Instructions

### 1. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
# Anthropic
ANTHROPIC_API_KEY=your_key

# Supabase
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Upstash Redis
UPSTASH_REDIS_REST_URL=your_url
UPSTASH_REDIS_REST_TOKEN=your_token

# Razorpay
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_secret

# Cron
CRON_SECRET=your_random_secret
```

### 2. Database Setup

1. Create a Supabase project
2. Run the SQL from `supabase-schema.sql` in Supabase SQL editor
3. Or use Supabase migration system:
   ```bash
   supabase migration new init
   # Copy supabase-schema.sql content
   supabase db push
   ```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Server runs on `http://localhost:3000`

### 5. Deploy to Vercel

```bash
vercel deploy
```

Make sure environment variables are set in Vercel project settings.

### 6. Configure Razorpay Webhook

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/payments/webhook`
3. Select events: `payment.authorized`, `payment.captured`, `payment.failed`
4. Copy webhook secret to environment variables if needed

### 7. Configure Cron Jobs

Vercel will automatically create cron jobs based on `vercel.json`. Daily credit reset runs at 00:00 UTC.

## API Endpoints

### AI Tools

```
POST /api/ai/whatsapp-writer
POST /api/ai/poster-maker
POST /api/ai/profit-advisor
POST /api/ai/gst-helper
POST /api/ai/review-replier

Request:
{
  "userInput": "Your request here",
  "language": "en" // optional, defaults to "en"
}

Response:
{
  "output": "AI-generated response"
}
```

### Authentication

```
POST /api/auth/signup
{
  "email": "user@example.com",
  "password": "secure_password"
}

POST /api/auth/login
{
  "email": "user@example.com",
  "password": "secure_password"
}

Response includes: access_token, refresh_token
```

### User Data

```
GET /api/user/credits
Header: Authorization: Bearer <token>

GET /api/user/history
Header: Authorization: Bearer <token>
```

### Payments

```
POST /api/payments/create-order
Header: Authorization: Bearer <token>
{
  "planType": "pro_monthly" | "pro_yearly"
}

Webhook: POST /api/payments/webhook
(Razorpay sends this automatically)
```

## TypeScript Types

All routes are fully typed with TypeScript. Key types:

- `UserPlan = "free" | "pro" | "guest"`
- Request/response types in each route file
- Supabase types auto-generated

## Security

- Row Level Security (RLS) enabled on all tables
- JWT token verification on protected routes
- Webhook signature verification for Razorpay
- Rate limiting for guest users
- Credit system prevents abuse

## Error Handling

- All errors logged to console
- User-friendly error messages in responses
- Proper HTTP status codes
- Failed payments handled gracefully

## Testing

Test endpoints using:

```bash
# Signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# AI Tool (guest)
curl -X POST http://localhost:3000/api/ai/whatsapp-writer \
  -H "Content-Type: application/json" \
  -d '{"userInput":"Help me write a message","language":"en"}'

# AI Tool (authenticated)
curl -X POST http://localhost:3000/api/ai/whatsapp-writer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"userInput":"Help me write a message"}'
```

## Live Deployment

Application deployed at: https://biz-saathi-48kl.vercel.app

## Support

For issues or questions, refer to:
- [Anthropic API Docs](https://docs.anthropic.com)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Razorpay Docs](https://razorpay.com/docs)
