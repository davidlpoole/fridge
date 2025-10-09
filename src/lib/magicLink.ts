// Magic link generation and verification utilities
import { getKv, KV_KEYS } from "./kv";
import type { MagicLink } from "./types";

const MAGIC_LINK_EXPIRY = 15 * 60 * 1000; // 15 minutes in milliseconds

/**
 * Generate a random token for magic links
 */
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Create a magic link token and store it in KV
 */
export async function createMagicLink(email: string): Promise<string> {
  const kv = await getKv();
  const token = generateToken();
  const now = Date.now();

  const magicLink: MagicLink = {
    email,
    token,
    expires_at: now + MAGIC_LINK_EXPIRY,
    created_at: now,
  };

  // Store magic link with token as key
  await kv.set([KV_KEYS.MAGIC_LINK, token], magicLink, {
    expireIn: MAGIC_LINK_EXPIRY,
  });

  return token;
}

/**
 * Verify a magic link token and return the email if valid
 */
export async function verifyMagicLink(token: string): Promise<string | null> {
  const kv = await getKv();
  const result = await kv.get<MagicLink>([KV_KEYS.MAGIC_LINK, token]);

  if (!result.value) {
    return null;
  }

  const magicLink = result.value;

  // Check if expired
  if (magicLink.expires_at < Date.now()) {
    await kv.delete([KV_KEYS.MAGIC_LINK, token]);
    return null;
  }

  // Delete the token after successful verification (one-time use)
  await kv.delete([KV_KEYS.MAGIC_LINK, token]);

  return magicLink.email;
}

/**
 * Get the base URL for the application
 */
export function getBaseUrl(request: Request): string {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

/**
 * Generate the full magic link URL
 */
export function generateMagicLinkUrl(baseUrl: string, token: string): string {
  return `${baseUrl}/api/auth/verify?token=${token}`;
}
