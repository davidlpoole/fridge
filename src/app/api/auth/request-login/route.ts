import { NextResponse } from "next/server";
import { createErrorResponse, ErrorCode } from "@/lib/errors";
import { validateLoginRequest } from "@/lib/validation";
import { checkAuthRateLimit, getClientIdentifier } from "@/lib/authRateLimit";
import { createMagicLink, generateMagicLinkUrl, getBaseUrl } from "@/lib/magicLink";
import { sendMagicLinkEmail, isEmailConfigured } from "@/lib/email";
import { getUserData, createUser } from "@/lib/user";

export async function POST(request: Request) {
  try {
    // Check if email service is configured
    if (!isEmailConfigured()) {
      return createErrorResponse(
        "Email service not configured",
        500,
        ErrorCode.INTERNAL_ERROR,
        "The authentication service is not properly configured. Please contact support."
      );
    }

    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimit = await checkAuthRateLimit(clientId);

    if (!rateLimit.allowed) {
      const headers = new Headers();
      headers.set("X-RateLimit-Limit", "5");
      headers.set("X-RateLimit-Remaining", "0");
      headers.set("X-RateLimit-Reset", new Date(rateLimit.reset_at).toISOString());

      return createErrorResponse(
        "Too many login requests",
        429,
        ErrorCode.RATE_LIMIT_EXCEEDED,
        `Please wait before requesting another login link. Reset at ${new Date(rateLimit.reset_at).toLocaleTimeString()}`,
        headers
      );
    }

    // Parse and validate request
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return createErrorResponse(
        "Invalid JSON in request body",
        400,
        ErrorCode.INVALID_REQUEST,
        "Request body must be valid JSON"
      );
    }

    const validation = validateLoginRequest(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return createErrorResponse(
        "Invalid request data",
        400,
        ErrorCode.VALIDATION_ERROR,
        firstError ? `${firstError.path.join(".")}: ${firstError.message}` : "Validation failed"
      );
    }

    const { email } = validation.data;

    // Check if user exists, if not create one
    let user = await getUserData(email);
    if (!user) {
      user = await createUser(email);
    }

    // Generate magic link token
    const token = await createMagicLink(email);
    const baseUrl = getBaseUrl(request);
    const magicLinkUrl = generateMagicLinkUrl(baseUrl, token);

    // Send email
    const emailSent = await sendMagicLinkEmail(email, magicLinkUrl);

    if (!emailSent) {
      return createErrorResponse(
        "Failed to send email",
        500,
        ErrorCode.INTERNAL_ERROR,
        "We couldn't send the login link. Please try again later."
      );
    }

    // Return success response
    const headers = new Headers();
    headers.set("X-RateLimit-Limit", "5");
    headers.set("X-RateLimit-Remaining", rateLimit.remaining.toString());
    headers.set("X-RateLimit-Reset", new Date(rateLimit.reset_at).toISOString());

    return NextResponse.json(
      {
        success: true,
        message: "Login link sent! Check your email.",
      },
      { headers }
    );
  } catch (error) {
    console.error("Error in login request:", error);
    return createErrorResponse(
      "Internal server error",
      500,
      ErrorCode.INTERNAL_ERROR,
      error instanceof Error ? error.message : "An unexpected error occurred"
    );
  }
}
