import { NextResponse } from "next/server";
import { createErrorResponse, ErrorCode } from "@/lib/errors";
import { getSessionTokenFromCookies, getSession } from "@/lib/session";
import { getUserData, getUserProfile, updateUser, deleteUser } from "@/lib/user";
import { validateUpdateProfile } from "@/lib/validation";
import { encrypt } from "@/lib/encryption";

/**
 * GET /api/user - Get user profile
 */
export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie");
    const sessionToken = getSessionTokenFromCookies(cookieHeader);

    if (!sessionToken) {
      return createErrorResponse(
        "Not authenticated",
        401,
        ErrorCode.API_KEY_MISSING,
        "Please log in to access your profile"
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

    const userData = await getUserData(session.email);
    if (!userData) {
      return createErrorResponse(
        "User not found",
        404,
        ErrorCode.INVALID_REQUEST,
        "User profile not found"
      );
    }

    const profile = getUserProfile(userData);

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error getting user profile:", error);
    return createErrorResponse(
      "Internal server error",
      500,
      ErrorCode.INTERNAL_ERROR,
      error instanceof Error ? error.message : "An unexpected error occurred"
    );
  }
}

/**
 * PUT /api/user - Update user profile
 */
export async function PUT(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie");
    const sessionToken = getSessionTokenFromCookies(cookieHeader);

    if (!sessionToken) {
      return createErrorResponse(
        "Not authenticated",
        401,
        ErrorCode.API_KEY_MISSING,
        "Please log in to update your profile"
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

    const validation = validateUpdateProfile(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return createErrorResponse(
        "Invalid request data",
        400,
        ErrorCode.VALIDATION_ERROR,
        firstError ? `${firstError.path.join(".")}: ${firstError.message}` : "Validation failed"
      );
    }

    const updates: {
      dietary?: string;
      groq_api_key_encrypted?: string;
    } = {};

    if (validation.data.dietary !== undefined) {
      updates.dietary = validation.data.dietary;
    }

    if (validation.data.groq_api_key !== undefined) {
      if (validation.data.groq_api_key === "") {
        // Remove API key
        updates.groq_api_key_encrypted = undefined;
      } else {
        // Encrypt and store API key
        updates.groq_api_key_encrypted = await encrypt(validation.data.groq_api_key);
      }
    }

    const updatedUser = await updateUser(session.email, updates);

    if (!updatedUser) {
      return createErrorResponse(
        "Failed to update profile",
        500,
        ErrorCode.INTERNAL_ERROR,
        "Could not update user profile"
      );
    }

    const profile = getUserProfile(updatedUser);

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return createErrorResponse(
      "Internal server error",
      500,
      ErrorCode.INTERNAL_ERROR,
      error instanceof Error ? error.message : "An unexpected error occurred"
    );
  }
}

/**
 * DELETE /api/user - Delete user account
 */
export async function DELETE(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie");
    const sessionToken = getSessionTokenFromCookies(cookieHeader);

    if (!sessionToken) {
      return createErrorResponse(
        "Not authenticated",
        401,
        ErrorCode.API_KEY_MISSING,
        "Please log in to delete your account"
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

    const deleted = await deleteUser(session.email);

    if (!deleted) {
      return createErrorResponse(
        "User not found",
        404,
        ErrorCode.INVALID_REQUEST,
        "User profile not found"
      );
    }

    // Clear session
    const { deleteSession, clearSessionCookie } = await import("@/lib/session");
    await deleteSession(sessionToken);

    const response = NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });

    response.headers.set("Set-Cookie", clearSessionCookie());

    return response;
  } catch (error) {
    console.error("Error deleting user account:", error);
    return createErrorResponse(
      "Internal server error",
      500,
      ErrorCode.INTERNAL_ERROR,
      error instanceof Error ? error.message : "An unexpected error occurred"
    );
  }
}
