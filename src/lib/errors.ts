import { NextResponse } from "next/server";
import type { ErrorResponse } from "./types";

// Error codes for better client-side handling
export enum ErrorCode {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  API_KEY_MISSING = "API_KEY_MISSING",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  EXTERNAL_API_ERROR = "EXTERNAL_API_ERROR",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  INVALID_REQUEST = "INVALID_REQUEST",
}

// Helper function to create error responses
export function createErrorResponse(
  error: string,
  status: number,
  code?: ErrorCode,
  details?: string
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      error,
      code,
      details,
    },
    { status }
  );
}

// Helper to handle Groq API errors
export function handleGroqError(error: unknown): NextResponse<ErrorResponse> {
  console.error("Groq API Error:", error);

  if (error instanceof Error) {
    // Check for specific error types
    if (error.message.includes("API key")) {
      return createErrorResponse(
        "Invalid API key",
        401,
        ErrorCode.API_KEY_MISSING,
        "Please check your Groq API key"
      );
    }

    if (error.message.includes("rate limit")) {
      return createErrorResponse(
        "API rate limit exceeded",
        429,
        ErrorCode.RATE_LIMIT_EXCEEDED,
        "Please try again later"
      );
    }

    return createErrorResponse(
      "Failed to generate recipes",
      500,
      ErrorCode.EXTERNAL_API_ERROR,
      error.message
    );
  }

  return createErrorResponse(
    "An unexpected error occurred",
    500,
    ErrorCode.INTERNAL_ERROR
  );
}
