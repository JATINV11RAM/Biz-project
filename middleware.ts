import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "./lib/ratelimit";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Guard /api/ai/* routes
  if (pathname.startsWith("/api/ai/")) {
    // Check guest rate limit based on IP
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const withinRateLimit = await checkRateLimit(ip);

    if (!withinRateLimit) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Maximum 3 requests per day." },
        { status: 429 }
      );
    }
  }

  // For protected routes, verify authentication
  if (pathname.startsWith("/api/user/") || pathname.startsWith("/api/payments/")) {
    // Protected routes require authentication
    // You'll need to add proper auth verification here
    // This can be done with getSession() or custom JWT verification
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/ai/:path*",
    "/api/user/:path*",
    "/api/payments/:path*",
  ],
};
