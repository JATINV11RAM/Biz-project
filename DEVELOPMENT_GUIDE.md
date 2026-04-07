# BizSaathi Backend - Development Guide

## Project Architecture

### Technology Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **ORM**: Supabase JS Client
- **AI**: Anthropic Claude 3.5 Sonnet
- **Authentication**: Supabase Auth (JWT)
- **Rate Limiting**: Upstash Redis
- **Payments**: Razorpay
- **Deployment**: Vercel

### Code Organization

```
lib/                 → Shared utilities (no dependencies on routes)
  ├── ai.ts         → AI client
  ├── supabase.ts   → Database client
  ├── ratelimit.ts  → Rate limiting
  ├── credits.ts    → Credit management
  ├── auth.ts       → JWT verification
  ├── types.ts      → Type definitions
  ├── constants.ts  → Constants
  └── api-helpers.ts→ Response helpers

app/api/            → API routes
  ├── ai/           → AI endpoints
  ├── auth/         → Authentication
  ├── user/         → User data
  ├── payments/     → Payments
  └── cron/         → Scheduled jobs

middleware.ts       → Route protection & middleware
```

## Coding Patterns

### Error Handling

```typescript
// ✅ Good - Using helper
import { errorResponse, handleApiError } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    // do something
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, "Operation failed");
  }
}

// ✅ Also Good - Explicit
import { errorResponse } from "@/lib/api-helpers";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    if (!data.field) {
      return errorResponse("Field is required", 400);
    }
  } catch (error) {
    console.error("Error:", error);
    return errorResponse("Internal server error", 500);
  }
}
```

### Authentication

```typescript
// Get user ID from Authorization header
import { getUserIdFromHeader } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const userId = await getUserIdFromHeader(authHeader);
  
  if (!userId) {
    return errorResponse("Unauthorized", 401);
  }
  
  // User is authenticated
}
```

### Database Operations

```typescript
// Always use error handling
import { supabaseAdmin } from "@/lib/supabase";

// ✅ Good
const { data, error } = await supabaseAdmin
  .from("users")
  .select("*")
  .eq("id", userId)
  .single();

if (error) {
  console.error("Error:", error);
  return errorResponse("Failed to fetch user", 500);
}

// Use data safely
return NextResponse.json(data);

// ❌ Avoid - no error handling
const { data } = await supabaseAdmin
  .from("users")
  .select("*");
// What if it fails? data will be null
```

### Rate Limiting

```typescript
// For guest users (use by IP)
import { checkRateLimit } from "@/lib/ratelimit";

const ip = request.headers.get("x-forwarded-for") || "unknown";
const withinLimit = await checkRateLimit(ip);

if (!withinLimit) {
  return rateLimitError(); // 429 Too Many Requests
}
```

### Credit Management

```typescript
import { checkCredits, deductCredit } from "@/lib/credits";

// Check if user can use credits
const { canUse, remaining } = await checkCredits(userId);

if (!canUse) {
  return insufficientCreditsError(); // 402 Payment Required
}

// Use the feature
const output = await callAI(prompt, input);

// Deduct credit
const success = await deductCredit(userId);
if (!success) {
  console.error("Failed to deduct credit");
}
```

### AI Calls

```typescript
import { callAI } from "@/lib/ai";

// System prompt should start with "You are BizSaathi AI..."
const systemPrompt = `You are BizSaathi AI, a smart business assistant...`;

try {
  const output = await callAI(systemPrompt, userInput);
  
  // Output is already cleaned of provider metadata
  return NextResponse.json({ output });
} catch (error) {
  // Error already logged and formatted
  return errorResponse("Failed to generate response", 500);
}
```

## Adding New Routes

### 1. Create Directory
```bash
mkdir -p app/api/your-feature/your-route
```

### 2. Create route.ts
```typescript
import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-helpers";

export async function POST(request: NextRequest) {
  try {
    const { field1, field2 } = await request.json();
    
    // Validate
    if (!field1 || !field2) {
      return errorResponse("field1 and field2 are required", 400);
    }
    
    // Process
    const result = "something";
    
    // Return
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Route error:", error);
    return errorResponse("Failed to process request", 500);
  }
}
```

### 3. Add to middleware.ts (if protected)
```typescript
export const config = {
  matcher: [
    "/api/ai/:path*",
    "/api/user/:path*",        // ← Add here
    "/api/payments/:path*",
  ],
};
```

## Testing Routes Locally

### Using curl
```bash
# Guest request
curl -X POST http://localhost:3000/api/ai/whatsapp-writer \
  -H "Content-Type: application/json" \
  -d '{"userInput":"Write a WhatsApp message","language":"en"}'

# Authenticated request
curl -X GET http://localhost:3000/api/user/credits \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using VS Code REST Client
Create `test.http`:
```http
### WhatsApp Writer
POST http://localhost:3000/api/ai/whatsapp-writer
Content-Type: application/json

{
  "userInput": "Write a WhatsApp message",
  "language": "en"
}

### Get Credits
GET http://localhost:3000/api/user/credits
Authorization: Bearer YOUR_TOKEN
```

## Common Tasks

### Add a New AI Tool

1. Create route file: `app/api/ai/your-tool/route.ts`
2. Copy template from existing tool (e.g., whatsapp-writer)
3. Update system prompt for your tool
4. Update constant in `lib/constants.ts`
5. Test locally
6. Deploy

### Change Credit Limits

Edit `lib/credits.ts`:
```typescript
const FREE_DAILY_CREDITS = 10; // Change here
```

### Change Rate Limit

Edit `lib/ratelimit.ts`:
```typescript
export const guestRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 d"), // Change "3" here
  analytics: true,
});
```

### Add API Key Authentication

```typescript
// In your route
const apiKey = request.headers.get("x-api-key");
if (apiKey !== process.env.API_KEY) {
  return errorResponse("Invalid API key", 401);
}
```

### Enable CORS

```typescript
// Add to next.config.js
async headers() {
  return [
    {
      source: "/api/:path*",
      headers: [
        {
          key: "Access-Control-Allow-Origin",
          value: "https://yourdomain.com",
        },
      ],
    },
  ];
}
```

## Debugging

### Enable Logging
Add to top of route:
```typescript
console.log("Incoming request:", {
  method: request.method,
  url: request.url,
  headers: Object.fromEntries(request.headers),
});
```

### Check Database
```typescript
// In Supabase dashboard SQL editor
SELECT * FROM users;
SELECT * FROM tool_usage ORDER BY created_at DESC LIMIT 20;
SELECT * FROM orders;
```

### Test Rate Limiting Locally
```typescript
// In lib/ratelimit.ts, comment out Redis check
const redis = null; // Temporarily disable actual rate limiting
```

### Verify Environment Variables
```bash
# In your route
console.log("Env check:", {
  hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
  hasSupabaseUrl: !!process.env.SUPABASE_URL,
});
```

## Performance Tips

1. **Cache Supabase queries** if they don't change frequently
2. **Use indexes** on frequently queried fields (already done)
3. **Limit query results** with `.limit(100)` to avoid large transfers
4. **Use `select()` carefully** - only fetch needed fields
5. **Defer non-critical queries** to background jobs
6. **Monitor AI response times** - they can be slow
7. **Batch database operations** when possible

## Security Best Practices

1. ✅ Never log API keys or tokens
2. ✅ Always verify JWTs before using
3. ✅ Use RLS policies on all tables
4. ✅ Sanitize user inputs
5. ✅ Use rate limiting for public endpoints
6. ✅ Validate webhook signatures
7. ✅ Use environment variables for secrets
8. ✅ Enable HTTPS in production (Vercel default)
9. ✅ Regularly rotate secrets
10. ✅ Keep dependencies updated

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Linting & Type Checking
npm run lint             # Run ESLint
npm run type-check       # TypeScript check

# Database
npm install supabase     # Install Supabase CLI (optional)
supabase migration new   # Create migration (optional)

# Environment
cp .env.local.example .env.local  # Create local env file
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes
git add .
git commit -m "feat: add new feature"

# Push to GitHub
git push origin feature/your-feature

# Create PR, get reviewed, merge to main
# Vercel auto-deploys preview and production
```

## Resources

- [Next.js API Routes Docs](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Anthropic API Reference](https://docs.anthropic.com/en/api/messages)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vercel Deployment Guide](https://vercel.com/docs/framework-guides/nextjs)

---

**Happy Coding! 🚀**
