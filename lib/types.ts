// Type definitions for API responses

export interface AIResponse {
  output: string;
}

export interface ErrorResponse {
  error: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id: string;
    email: string;
  };
  session?: {
    access_token: string;
    refresh_token: string;
  };
}

export interface CreditsResponse {
  credits_remaining: number;
  plan: "free" | "pro";
}

export interface HistoryItem {
  id: string;
  tool_name: string;
  output: string;
  created_at: string;
}

export interface HistoryResponse {
  history: HistoryItem[];
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  planType: string;
  databaseId: string;
}
