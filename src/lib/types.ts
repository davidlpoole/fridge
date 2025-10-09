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

// User and Authentication Types

export interface UserData {
  email: string;
  items: string[];
  dietary: string;
  groq_api_key_encrypted?: string; // Encrypted API key
  created_at: number;
  updated_at: number;
}

export interface MagicLink {
  email: string;
  token: string;
  expires_at: number;
  created_at: number;
}

export interface Session {
  email: string;
  token: string;
  created_at: number;
  expires_at: number;
}

export interface LoginRequest {
  email: string;
}

export interface LoginResponse {
  message: string;
  success: boolean;
}

export interface UserProfile {
  email: string;
  items: string[];
  dietary: string;
  has_api_key: boolean;
}

export interface UpdateProfileRequest {
  dietary?: string;
  groq_api_key?: string; // Will be encrypted server-side
}

export interface SyncDataRequest {
  items: string[];
  dietary?: string;
  groq_api_key?: string;
}
