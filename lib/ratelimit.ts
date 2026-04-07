import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

if (
  !process.env.UPSTASH_REDIS_REST_URL ||
  !process.env.UPSTASH_REDIS_REST_TOKEN
) {
  throw new Error("Missing Upstash Redis environment variables");
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// 3 requests per day for guests
export const guestRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 d"),
  analytics: true,
});

export async function checkRateLimit(ip: string): Promise<boolean> {
  try {
    const result = await guestRatelimit.limit(ip);
    return result.success;
  } catch (error) {
    console.error("Rate limit check error:", error);
    // Fail open on error
    return true;
  }
}
