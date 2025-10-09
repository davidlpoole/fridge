import { NextResponse } from "next/server";
import { createErrorResponse, ErrorCode } from "@/lib/errors";
import { getSessionTokenFromCookies, getSession } from "@/lib/session";
import { syncUserData, getUserProfile } from "@/lib/user";
import { validateSyncData } from "@/lib/validation";

/**
 * POST /api/user/sync - Sync local data to user profile
 */
export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie");
    const sessionToken = getSessionTokenFromCookies(cookieHeader);

    if (!sessionToken) {
      return createErrorResponse(
        "Not authenticated",
        401,
        ErrorCode.API_KEY_MISSING,
        "Please log in to sync your data"
      );
    }

    const session = await getSession(sessionToken);
    if (!session) {
      return createErrorResponse(
        "Invalid session",
        401,
        ErrorCode.API_KEY_MISSING,
        "Your session has expired. Please log in again."
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

    const validation = validateSyncData(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return createErrorResponse(
        "Invalid request data",
        400,
        ErrorCode.VALIDATION_ERROR,
        firstError ? `${firstError.path.join(".")}: ${firstError.message}` : "Validation failed"
      );
    }

    const { items, dietary, groq_api_key } = validation.data;

    // Sync user data
    const userData = await syncUserData(
      session.email,
      items || [],
      dietary || "",
      groq_api_key
    );

    const profile = getUserProfile(userData);

    return NextResponse.json({
      success: true,
      message: "Data synced successfully",
      profile,
    });
  } catch (error) {
    console.error("Error syncing user data:", error);
    return createErrorResponse(
      "Internal server error",
      500,
      ErrorCode.INTERNAL_ERROR,
      error instanceof Error ? error.message : "An unexpected error occurred"
    );
  }
}
