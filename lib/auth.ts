import { supabaseAdmin } from "@/lib/supabase";

/**
 * Verify JWT token and extract user ID
 * @param token - JWT token from Authorization header
 * @returns User ID if token is valid, null otherwise
 */
export async function verifyToken(token: string): Promise<string | null> {
  try {
    const {
      data: { user },
    } = await supabaseAdmin.auth.getUser(token);
    return user?.id || null;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

/**
 * Extract user ID from Authorization header
 * @param authorization - Authorization header value
 * @returns User ID if valid, null otherwise
 */
export async function getUserIdFromHeader(
  authorization: string | null
): Promise<string | null> {
  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.substring(7);
  return verifyToken(token);
}

/**
 * Get client IP from request
 * @param request - Next.js request object
 * @returns Client IP address
 */
export function getClientIp(request: { headers: { get: (key: string) => string | null } }): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
