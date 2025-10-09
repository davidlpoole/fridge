import { NextResponse } from "next/server";
import { createErrorResponse, ErrorCode } from "@/lib/errors";
import { getSessionTokenFromCookies, deleteSession, clearSessionCookie } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie");
    const sessionToken = getSessionTokenFromCookies(cookieHeader);

    if (!sessionToken) {
      return createErrorResponse(
        "Not authenticated",
        401,
        ErrorCode.API_KEY_MISSING,
        "No active session found"
      );
    }

    // Delete session from KV
    await deleteSession(sessionToken);

    // Return success with clear cookie header
    const response = NextResponse.json(
      {
        success: true,
        message: "Logged out successfully",
      },
      { status: 200 }
    );

    response.headers.set("Set-Cookie", clearSessionCookie());

    return response;
  } catch (error) {
    console.error("Error logging out:", error);
    return createErrorResponse(
      "Internal server error",
      500,
      ErrorCode.INTERNAL_ERROR,
      error instanceof Error ? error.message : "An unexpected error occurred"
    );
  }
}
