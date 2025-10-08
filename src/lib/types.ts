// API Request and Response Types

export interface RecipeRequest {
  items: string[];
  requirements?: string;
}

export interface RecipeResponse {
  recipes: string;
}

export interface ErrorResponse {
  error: string;
  details?: string;
  code?: string;
}

// Rate limiting types
export interface RateLimitInfo {
  remaining: number;
  reset: number;
  limit: number;
}
