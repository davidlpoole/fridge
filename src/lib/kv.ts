// Deno KV database utilities
// This module handles connections to Deno KV for data persistence

let kv: Deno.Kv | null = null;

/**
 * Get or create a connection to Deno KV
 */
export async function getKv(): Promise<Deno.Kv> {
  if (!kv) {
    // In development, use local KV storage
    // In production on Deno Deploy, this will use the platform KV
    kv = await Deno.openKv();
  }
  return kv;
}

/**
 * Close the KV connection (for cleanup)
 */
export async function closeKv(): Promise<void> {
  if (kv) {
    kv.close();
    kv = null;
  }
}

/**
 * KV key prefixes for different data types
 */
export const KV_KEYS = {
  USER: "user",
  MAGIC_LINK: "magic_link",
  SESSION: "session",
  RATE_LIMIT: "rate_limit",
} as const;
