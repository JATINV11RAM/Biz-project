import { NextResponse } from "next/server";

/**
 * Create a standardized error response
 */
export function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Create a standardized success response
 */
export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status });
}

/**
 * Handle errors in API routes
 */
export function handleApiError(error: unknown, defaultMessage: string) {
  console.error(defaultMessage, error);
  const message =
    error instanceof Error ? error.message : defaultMessage;
  return errorResponse(message, 500);
}

/**
 * Validate required fields in request body
 */
export function validateRequired(
  obj: Record<string, unknown>,
  fields: string[]
): string | null {
  for (const field of fields) {
    if (!obj[field]) {
      return `${field} is required`;
    }
  }
  return null;
}

/**
 * Rate limit error response
 */
export function rateLimitError() {
  return errorResponse(
    "Rate limit exceeded. Maximum 3 requests per day.",
    429
  );
}

/**
 * Insufficient credits error response
 */
export function insufficientCreditsError() {
  return errorResponse(
    "Insufficient credits. Please upgrade to Pro plan.",
    402
  );
}

/**
 * Unauthorized error response
 */
export function unauthorizedError() {
  return errorResponse("Unauthorized. Please provide a valid token.", 401);
}
