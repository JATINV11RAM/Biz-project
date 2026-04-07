# BizSaathi API Reference

Complete API documentation for BizSaathi Backend.

## Base URL

```
Development: http://localhost:3000
Production: https://biz-saathi-48kl.vercel.app
```

## Authentication

Most endpoints require JWT authentication via `Authorization` header:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Tokens are obtained from `/api/auth/login` endpoint.

---

## AI Tools

### WhatsApp Message Writer

Generate professional WhatsApp messages for business communication.

```http
POST /api/ai/whatsapp-writer
Content-Type: application/json

{
  "userInput": "I want to promote my handmade soaps on WhatsApp",
  "language": "en"
}
```

**Parameters:**
- `userInput` (string, required): The message request
- `language` (string, optional): Language code ('en', 'hi', 'ta', etc.) - defaults to 'en'

**Response:**
```json
{
  "output": "Hey! 🧼 Check out our premium handmade soaps... [full message]"
}
```

**Rate Limiting:**
- Guest (unauthenticated): 3 requests/day
- Free plan: 10 requests/day
- Pro plan: Unlimited

**Errors:**
- `400` - userInput missing
- `401` - Invalid token (if provided)
- `402` - Insufficient credits (authenticated user, free plan)
- `429` - Rate limit exceeded (guest user)
- `500` - Internal error

---

### Social Media Poster Maker

Create engaging social media poster captions and design briefs.

```http
POST /api/ai/poster-maker
Content-Type: application/json

{
  "userInput": "I want to announce a Diwali sale for my clothing store",
  "language": "en"
}
```

**Parameters:**
- `userInput` (string, required): Poster/content description
- `language` (string, optional): Language code - defaults to 'en'

**Response:**
```json
{
  "output": "✨ DIWALI SPECIAL! ✨\n\n50% OFF on all items... [complete poster content]"
}
```

**Rate Limiting:** Same as WhatsApp Writer

---

### Profit Optimization Advisor

Get actionable strategies to increase business profitability.

```http
POST /api/ai/profit-advisor
Content-Type: application/json

{
  "userInput": "I run a small bakery in Delhi with 3 employees. Monthly revenue is ₹80,000"
}
```

**Parameters:**
- `userInput` (string, required): Business details/situation
- `language` (string, optional): Language code - defaults to 'en'

**Response:**
```json
{
  "output": "Based on your bakery profile, here are 5 strategies to increase profit:\n\n1. Optimize pricing... [detailed advice]"
}
```

**Rate Limiting:** Same as WhatsApp Writer

---

### GST Compliance Helper

Get GST-related guidance and compliance information.

```http
POST /api/api/gst-helper
Content-Type: application/json

{
  "userInput": "What GST rate applies to restaurant services?",
  "language": "en"
}
```

**Parameters:**
- `userInput` (string, required): GST question
- `language` (string, optional): Language code - defaults to 'en'

**Response:**
```json
{
  "output": "Restaurant services (Dine-in) are subject to 5% GST... [complete answer]"
}
```

**Rate Limiting:** Same as WhatsApp Writer

**Note:** This is informational only, not legal advice.

---

### Customer Review Replier

Generate professional responses to customer reviews.

```http
POST /api/ai/review-replier
Content-Type: application/json

{
  "userInput": "Negative review: 'Poor service, waited 45 mins for food, staff was rude'"
}
```

**Parameters:**
- `userInput` (string, required): Review text to reply to
- `language` (string, optional): Language code - defaults to 'en'

**Response:**
```json
{
  "output": "Thank you for your feedback. We sincerely apologize for your experience... [professional reply]"
}
```

**Rate Limiting:** Same as WhatsApp Writer

---

## Authentication

### Sign Up

Create a new user account.

```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Parameters:**
- `email` (string, required): Valid email address
- `password` (string, required): At least 8 characters

**Response:**
```json
{
  "message": "Signup successful. Please check your email to confirm.",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com"
  }
}
```

**Errors:**
- `400` - Invalid email or password
- `400` - Email already registered
- `500` - Internal error

**Note:** User must confirm email before logging in (Supabase default).

---

### Sign In

Authenticate user and get access token.

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Parameters:**
- `email` (string, required): Registered email
- `password` (string, required): Account password

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com"
  },
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Usage:**
Use the `access_token` in the Authorization header for subsequent requests:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Errors:**
- `401` - Invalid email or password
- `401` - Email not confirmed
- `500` - Internal error

---

## User Data

### Get User Credits

Check remaining credits and plan status.

```http
GET /api/user/credits
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Parameters:** None

**Response:**
```json
{
  "credits_remaining": 5,
  "plan": "free"
}
```

**Breakdown:**
- `credits_remaining`: Number of credits left today (for free plan) or -1 (for pro)
- `plan`: "free" or "pro"

**Errors:**
- `401` - Missing or invalid token
- `500` - Internal error

---

### Get Usage History

Retrieve tool usage history for the user.

```http
GET /api/user/history
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Parameters:** None

**Response:**
```json
{
  "history": [
    {
      "id": "uuid",
      "tool_name": "whatsapp_writer",
      "output": "Hey! 🧼 Check out our premium handmade soaps...",
      "created_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": "uuid",
      "tool_name": "poster_maker",
      "output": "✨ DIWALI SPECIAL! ✨...",
      "created_at": "2024-01-15T09:15:00Z"
    }
  ]
}
```

**Notes:**
- Returns up to 50 most recent items
- Ordered by created_at (newest first)
- Output truncated to 1000 characters

**Errors:**
- `401` - Missing or invalid token
- `500` - Internal error

---

## Payments

### Create Payment Order

Initiate a Razorpay payment order for plan upgrade.

```http
POST /api/payments/create-order
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "planType": "pro_monthly"
}
```

**Parameters:**
- `planType` (string, required): "pro_monthly" or "pro_yearly"

**Plan Prices:**
- `pro_monthly`: ₹299/month
- `pro_yearly`: ₹2999/year

**Response:**
```json
{
  "orderId": "order_1736923634512_a1b2",
  "amount": 29900,
  "currency": "INR",
  "keyId": "rzp_live_xxxxx",
  "planType": "pro_monthly",
  "databaseId": "uuid"
}
```

**Usage:**
Pass this to Razorpay Checkout (frontend):
```javascript
const options = {
  key: response.keyId,
  amount: response.amount,
  currency: response.currency,
  order_id: response.orderId,
  handler: function(paymentResponse) {
    // Handle success
  }
};
const rzp = new Razorpay(options);
rzp.open();
```

**Errors:**
- `400` - planType missing or invalid
- `401` - Missing or invalid token
- `500` - Internal error

---

### Payment Webhook

Razorpay calls this endpoint automatically when payment succeeds/fails.

```http
POST /api/payments/webhook
Content-Type: application/json
X-Razorpay-Signature: signature_hash

{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_xxxxx",
        "entity_id": "order_xxxxx",
        "status": "captured"
      }
    }
  }
}
```

**Events Handled:**
- `payment.authorized` → Updates order to "completed"
- `payment.captured` → Updates user plan to "pro"
- `payment.failed` → Updates order to "failed"

**Automatic Actions:**
- On successful payment:
  1. Order status updated to "completed"
  2. User plan upgraded to "pro"
  3. Credits set to unlimited

**Setup:**
1. Razorpay Dashboard → Settings → Webhooks
2. URL: `https://yourdomain.com/api/payments/webhook`
3. Events: payment.authorized, payment.captured, payment.failed
4. Webhook secret verified (via signature)

**Response:**
```json
{
  "status": "success"
}
```

**Errors:**
- `401` - Invalid webhook signature
- `404` - Order not found
- `500` - Processing error

---

## Cron Jobs

### Reset Daily Credits

Reset free plan user credits to 10 daily.

```http
GET /api/cron/reset-credits
Authorization: Bearer CRON_SECRET
```

**Configuration:**
- Scheduled: Every day at 00:00 UTC
- Configured in: `vercel.json`
- Authorization: Bearer token matches `CRON_SECRET` env var

**Response:**
```json
{
  "success": true,
  "message": "Daily credits reset successfully"
}
```

**Errors:**
- `401` - Invalid or missing authorization
- `500` - Internal error

**Note:** Called automatically by Vercel Cron, not intended for manual use.

---

## Error Handling

### Standard Error Response

All error responses follow this format:

```json
{
  "error": "Description of what went wrong"
}
```

### HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful GET/POST |
| 201 | Created | User successfully created |
| 400 | Bad Request | Missing/invalid parameters |
| 401 | Unauthorized | Invalid/missing token |
| 402 | Payment Required | Insufficient credits (free plan) |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal server error |

---

## Rate Limiting

### Guest Users (Unauthenticated)

- **Limit**: 3 requests per day
- **Tracked by**: IP address
- **Applies to**: All `/api/ai/*` endpoints
- **Header**: `x-forwarded-for` or `x-real-ip`

### Authenticated Users

**Free Plan:**
- 10 credits per day
- Each AI endpoint uses 1 credit
- Credits reset at 00:00 UTC daily

**Pro Plan:**
- Unlimited credits
- No rate limiting

---

## Rate Limit Response

When rate limit exceeded:

```json
{
  "error": "Rate limit exceeded. Maximum 3 requests per day."
}
```

HTTP Status: `429 Too Many Requests`

---

## Credit Management

### Deduction
- Triggered: After successful AI response
- Amount: 1 credit per request
- Users affected: Free plan only

### Reset
- Frequency: Daily at 00:00 UTC
- Users affected: Free plan only
- Method: Automatic cron job

### Purchase
- Via: `/api/payments/create-order`
- Plans: Pro Monthly (₹299) or Pro Yearly (₹2999)
- Effect: Unlimited credits + all features

---

## Examples

### Complete Flow - Guest User Using AI

```bash
# 1. Call AI endpoint (guest, no auth)
curl -X POST http://localhost:3000/api/ai/whatsapp-writer \
  -H "Content-Type: application/json" \
  -d '{"userInput":"Write a WhatsApp message for my shop"}'

# Response:
# {
#   "output": "Hey! 🏪 Check out our amazing products... [complete message]"
# }

# 2. Call again
curl -X POST http://localhost:3000/api/ai/whatsapp-writer \
  -H "Content-Type: application/json" \
  -d '{"userInput":"Different message"}'

# 3. Call a 3rd time
curl -X POST http://localhost:3000/api/ai/whatsapp-writer \
  -H "Content-Type: application/json" \
  -d '{"userInput":"Another message"}'

# 4. Call 4th time → Rate limited!
# Response: 429 Too Many Requests
# {
#   "error": "Rate limit exceeded. Maximum 3 requests per day."
# }
```

### Complete Flow - Authenticated User

```bash
# 1. Sign up
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secure123"}'

# Response:
# {
#   "message": "Signup successful. Please check your email to confirm.",
#   "user": {"id": "uuid", "email": "user@example.com"}
# }

# 2. Login (after email confirmation)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secure123"}'

# Response:
# {
#   "message": "Login successful",
#   "session": {
#     "access_token": "eyJhbGciOiJIUzI1NiIs...",
#     "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
#   }
# }

# 3. Use AI endpoint with token
TOKEN="eyJhbGciOiJIUzI1NiIs..."
curl -X POST http://localhost:3000/api/ai/whatsapp-writer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"userInput":"Write WhatsApp message"}'

# Response:
# {
#   "output": "[AI generated message]"
# }

# 4. Check remaining credits
curl -X GET http://localhost:3000/api/user/credits \
  -H "Authorization: Bearer $TOKEN"

# Response:
# {
#   "credits_remaining": 9,
#   "plan": "free"
# }

# 5. View usage history
curl -X GET http://localhost:3000/api/user/history \
  -H "Authorization: Bearer $TOKEN"

# Response:
# {
#   "history": [
#     {
#       "tool_name": "whatsapp_writer",
#       "output": "[AI generated message]",
#       "created_at": "2024-01-15T10:30:00Z"
#     }
#   ]
# }
```

### Payment Flow

```bash
# 1. Create upgrade order
TOKEN="eyJhbGciOiJIUzI1NiIs..."
curl -X POST http://localhost:3000/api/payments/create-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"planType":"pro_monthly"}'

# Response:
# {
#   "orderId": "order_1736923634512_a1b2",
#   "amount": 29900,
#   "currency": "INR",
#   "keyId": "rzp_live_xxxxx"
# }

# 2. Frontend initializes Razorpay checkout with above data
# 3. User completes payment
# 4. Razorpay webhook calls /api/payments/webhook
# 5. User automatically upgraded to Pro plan
```

---

## Support

For issues or questions:
- Check [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- Review [Development Guide](./DEVELOPMENT_GUIDE.md)
- See [README](./README.md) for setup
- Contact API service providers:
  - Anthropic: support@anthropic.com
  - Supabase: Discord community
  - Razorpay: support@razorpay.com
