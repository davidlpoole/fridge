// Session management utilities
import { getKv, KV_KEYS } from "./kv";
import type { Session } from "./types";
import { SignJWT, jwtVerify } from "jose";

const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default-jwt-secret-change-in-production"
);

/**
 * Create a new session for a user
 */
export async function createSession(email: string): Promise<string> {
  const kv = await getKv();
  
  // Generate session token using JWT
  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);

  const session: Session = {
    email,
    token,
    created_at: Date.now(),
    expires_at: Date.now() + SESSION_DURATION,
  };

  // Store session in KV with token as key
  await kv.set([KV_KEYS.SESSION, token], session, {
    expireIn: SESSION_DURATION,
  });

  return token;
}

/**
 * Verify and get session from token
 */
export async function getSession(token: string): Promise<Session | null> {
  try {
    // Verify JWT
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    if (!payload.email || typeof payload.email !== "string") {
      return null;
    }

    const kv = await getKv();
    const result = await kv.get<Session>([KV_KEYS.SESSION, token]);

    if (!result.value) {
      return null;
    }

    // Check if session is expired
    if (result.value.expires_at < Date.now()) {
      await deleteSession(token);
      return null;
    }

    return result.value;
  } catch (error) {
    console.error("Session verification error:", error);
    return null;
  }
}

/**
 * Delete a session
 */
export async function deleteSession(token: string): Promise<void> {
  const kv = await getKv();
  await kv.delete([KV_KEYS.SESSION, token]);
}

/**
 * Extract session token from cookies
 */
export function getSessionTokenFromCookies(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const sessionCookie = cookies.find((c) => c.startsWith("session="));

  if (!sessionCookie) return null;

  return sessionCookie.split("=")[1];
}

/**
 * Create session cookie string
 */
export function createSessionCookie(token: string): string {
  const maxAge = SESSION_DURATION / 1000; // Convert to seconds
  
  return `session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

/**
 * Create cookie string to clear session
 */
export function clearSessionCookie(): string {
  return "session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0";
}
