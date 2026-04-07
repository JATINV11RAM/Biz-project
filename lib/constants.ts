// Application constants

export const TOOL_NAMES = {
  WHATSAPP_WRITER: "whatsapp_writer",
  POSTER_MAKER: "poster_maker",
  PROFIT_ADVISOR: "profit_advisor",
  GST_HELPER: "gst_helper",
  REVIEW_REPLIER: "review_replier",
} as const;

export const CREDIT_LIMITS = {
  FREE_DAILY: 10,
  PRO_DAILY: Infinity,
} as const;

export const RATE_LIMITS = {
  GUEST_DAILY: 3,
} as const;

export const PLANS = {
  FREE: "free",
  PRO: "pro",
  GUEST: "guest",
} as const;

export const PLAN_PRICES = {
  PRO_MONTHLY: 29900, // in paise (₹299)
  PRO_YEARLY: 299900, // in paise (₹2999)
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  PAYMENT_REQUIRED: 402,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
} as const;

export const AI_BRAND_NAME = "BizSaathi AI";
