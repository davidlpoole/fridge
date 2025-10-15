// API Request and Response Types

export interface RecipeRequest {
  items: string[];
  requirements?: string;
}

// Structured recipe types
export interface RecipeStep {
  step_number: number;
  instruction: string;
}

export interface Recipe {
  name: string;
  description: string;
  steps?: RecipeStep[];
}

export interface StructuredRecipeResponse {
  recipes: Recipe[];
}

// Legacy response type (for backward compatibility if needed)
export interface RecipeResponse {
  recipes: string | StructuredRecipeResponse;
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
