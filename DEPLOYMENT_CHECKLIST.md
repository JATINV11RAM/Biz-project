# BizSaathi Backend - Deployment Checklist

Complete this checklist to ensure smooth deployment to production.

## Pre-Deployment

### Code & Configuration
- [ ] All environment variables in `.env.local.example`
- [ ] No secrets committed to repository
- [ ] TypeScript compilation successful (`npm run build`)
- [ ] No linting errors (`npm run lint`)
- [ ] All tests passing (if applicable)
- [ ] Code reviewed

### Git
- [ ] Code pushed to main branch
- [ ] All commits have clear messages
- [ ] No uncommitted changes

## Database Setup (Supabase)

### Create Project
- [ ] Create Supabase project at [supabase.com](https://supabase.com)
- [ ] Copy Project URL to `SUPABASE_URL`
- [ ] Copy Anon Key to `SUPABASE_ANON_KEY`
- [ ] Copy Service Role Key to `SUPABASE_SERVICE_ROLE_KEY`

### Database Schema
- [ ] Open Supabase SQL Editor
- [ ] Run all SQL from `supabase-schema.sql`
- [ ] Verify tables created: users, tool_usage, orders
- [ ] Verify RLS policies enabled
- [ ] Test query: `SELECT * FROM users LIMIT 1`

### Authentication
- [ ] Enable Email/Password Provider in Auth Settings
- [ ] Configure email templates (optional)
- [ ] Test signup/login locally

## API Services Setup

### Anthropic API
- [ ] Create account at [console.anthropic.com](https://console.anthropic.com)
- [ ] Create API key
- [ ] Add to `ANTHROPIC_API_KEY` env var
- [ ] Test: Call `/api/ai/whatsapp-writer` locally

### Upstash Redis (Rate Limiting)
- [ ] Create account at [upstash.com](https://upstash.com)
- [ ] Create Redis database
- [ ] Copy REST URL to `UPSTASH_REDIS_REST_URL`
- [ ] Copy Token to `UPSTASH_REDIS_REST_TOKEN`
- [ ] Test: Make 4 guest requests to AI endpoints (4th should fail)

### Razorpay (Payments)
- [ ] Create account at [razorpay.com](https://razorpay.com)
- [ ] Go to Settings → API Keys
- [ ] Copy Key ID to `RAZORPAY_KEY_ID`
- [ ] Copy Key Secret to `RAZORPAY_KEY_SECRET`
- [ ] (Optional in test mode) Get Webhook Secret from Settings → Webhooks
- [ ] Test: Create payment order with `/api/payments/create-order`

## Local Testing

Before deploying, test everything locally:

```bash
# Start dev server
npm run dev

# Test AI endpoints (guest)
curl -X POST http://localhost:3000/api/ai/whatsapp-writer \
  -H "Content-Type: application/json" \
  -d '{"userInput":"test"}'

# Test signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Test authenticated endpoint (use token from login response)
curl -X GET http://localhost:3000/api/user/credits \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Checklist
- [ ] Guest can call AI endpoints
- [ ] Rate limiting works (4th call fails)
- [ ] User can sign up
- [ ] User can log in
- [ ] User gets access token
- [ ] Authenticated user can call AI endpoints
- [ ] Credits deducted after each call
- [ ] Can fetch usage history
- [ ] Can create payment order
- [ ] Can view remaining credits

## Vercel Deployment

### Create Project
- [ ] Create Vercel account at [vercel.com](https://vercel.com)
- [ ] Connect GitHub repository
- [ ] Select project root directory (if needed)

### Configure Environment Variables
In Vercel Dashboard → Project Settings → Environment Variables, add:

```
ANTHROPIC_API_KEY = sk-ant-...
SUPABASE_URL = https://xxxxx.supabase.co
SUPABASE_ANON_KEY = eyJ...
SUPABASE_SERVICE_ROLE_KEY = eyJ...
UPSTASH_REDIS_REST_URL = https://...
UPSTASH_REDIS_REST_TOKEN = ...
RAZORPAY_KEY_ID = rzp_...
RAZORPAY_KEY_SECRET = ...
CRON_SECRET = random_secret_for_cron_jobs
NEXT_PUBLIC_API_URL = https://your-domain.vercel.app
```

### Deploy
- [ ] Trigger deployment (automatic on git push or manual)
- [ ] Wait for build to complete
- [ ] Verify no build errors
- [ ] Check preview deployment first (optional)
- [ ] Promote to production

### Verify Deployment
- [ ] Production URL loads (check Vercel dashboard)
- [ ] Test API endpoints on production domain
- [ ] Check Vercel logs for errors
- [ ] Monitor error rates in Vercel

## Post-Deployment

### Razorpay Webhook
- [ ] Go to Razorpay Dashboard → Settings → Webhooks
- [ ] Add new webhook
- [ ] URL: `https://your-domain.vercel.app/api/payments/webhook`
- [ ] Select events:
  - [ ] payment.authorized
  - [ ] payment.captured
  - [ ] payment.failed
- [ ] Save webhook
- [ ] Test with Razorpay test payment

### Cron Jobs
- [ ] Verify in Vercel dashboard that cron is scheduled
- [ ] Check log at `/api/cron/reset-credits` at next scheduled time
- [ ] Verify credits reset for free users at 00:00 UTC

### Monitoring
- [ ] Set up error logging (optional: Sentry, LogRocket, etc.)
- [ ] Set up analytics (optional: Google Analytics, etc.)
- [ ] Configure alerts for failed payments
- [ ] Monitor API call rates and performance
- [ ] Set up status page (optional: statuspage.io)

### DNS & Domain
- [ ] Point custom domain to Vercel (if using one)
- [ ] Wait for DNS propagation
- [ ] Update NEXT_PUBLIC_API_URL if using custom domain
- [ ] Test with custom domain

### Backup & Security
- [ ] Enable Supabase backups
- [ ] Review RLS policies
- [ ] Test RLS policies work correctly
- [ ] Audit API keys access
- [ ] Enable 2FA on all service accounts

## Ongoing Maintenance

### Daily
- [ ] Check Vercel for deployment status
- [ ] Monitor error logs
- [ ] Verify cron jobs ran

### Weekly
- [ ] Review API usage and performance
- [ ] Check Supabase database size
- [ ] Verify all integrations working

### Monthly
- [ ] Review and rotate API keys (6-month rotation recommended)
- [ ] Update dependencies (`npm update`)
- [ ] Review security updates
- [ ] Backup critical data

## Troubleshooting

### Build Fails
- [ ] Check Node.js version compatibility
- [ ] Verify all env vars set
- [ ] Check TypeScript errors: `npm run type-check`

### API Endpoints 404
- [ ] Verify route files exist in correct directory
- [ ] Check file names match route structure
- [ ] Restart dev server

### Rate Limit Not Working
- [ ] Verify Upstash Redis credentials
- [ ] Check network connectivity
- [ ] Verify IP detection (use `x-forwarded-for` header)

### Payments Not Processing
- [ ] Verify Razorpay credentials
- [ ] Check webhook secret matches
- [ ] Test in Razorpay test mode first
- [ ] Verify webhook URL is public and accessible

### Credits Not Deducting
- [ ] Verify user exists in database
- [ ] Check credits column is INTEGER
- [ ] Test with authenticated user
- [ ] Check for errors in logs

### Cron Job Not Running
- [ ] Verify `vercel.json` has cron config
- [ ] Check `CRON_SECRET` is set
- [ ] Verify webhook accepts GET request
- [ ] Check Vercel cron logs

## Support Contacts

- **Anthropic Support**: support@anthropic.com
- **Supabase Discord**: [discord.gg/supabase](https://discord.gg/supabase)
- **Vercel Support**: support@vercel.com
- **Razorpay Support**: support@razorpay.com
- **Upstash Support**: support@upstash.com

## Documentation Links

- [Anthropic API Docs](https://docs.anthropic.com)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Razorpay Integration](https://razorpay.com/docs)
- [Upstash Documentation](https://upstash.com/docs)

---

**Deployment Completed**: _______________
**Deployed By**: _______________
**Date**: _______________
**Production URL**: _______________
