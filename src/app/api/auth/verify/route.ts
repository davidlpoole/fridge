import { NextResponse } from "next/server";
import { createErrorResponse, ErrorCode } from "@/lib/errors";
import { verifyMagicLink } from "@/lib/magicLink";
import { createSession, createSessionCookie } from "@/lib/session";
import { getBaseUrl } from "@/lib/magicLink";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    const baseUrl = getBaseUrl(request);

    if (!token) {
      return createErrorResponse(
        "Missing token",
        400,
        ErrorCode.INVALID_REQUEST,
        "No verification token provided"
      );
    }

    // Verify the magic link token
    const email = await verifyMagicLink(token);

    if (!email) {
      // Redirect to home with error
      return NextResponse.redirect(
        new URL("/?error=invalid_or_expired_link", baseUrl)
      );
    }

    // Create session
    const sessionToken = await createSession(email);

    // Redirect to home with session cookie
    const response = NextResponse.redirect(new URL("/?login=success", baseUrl));

    response.headers.set("Set-Cookie", createSessionCookie(sessionToken));

    return response;
  } catch (error) {
    console.error("Error verifying magic link:", error);
    return NextResponse.redirect(
      new URL("/?error=verification_failed", getBaseUrl(request))
    );
  }
}
