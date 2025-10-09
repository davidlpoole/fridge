// Deno KV database utilities
// This module handles connections to Deno KV for data persistence

interface DenoKv {
  get<T>(key: string[]): Promise<{ value: T | null }>;
  set(key: string[], value: unknown, options?: { expireIn?: number }): Promise<void>;
  delete(key: string[]): Promise<void>;
  close(): void;
}

interface DenoNamespace {
  openKv(): Promise<DenoKv>;
}

declare global {
  // eslint-disable-next-line no-var
  var Deno: DenoNamespace | undefined;
}

let kv: DenoKv | null = null;

/**
 * Get or create a connection to Deno KV
 */
export async function getKv(): Promise<DenoKv> {
  if (!kv) {
    // Check if running in Deno environment
    if (typeof globalThis.Deno !== "undefined" && globalThis.Deno.openKv) {
      kv = await globalThis.Deno.openKv();
    } else {
      throw new Error(
        "Deno KV is not available. This feature requires running on Deno Deploy or Deno runtime."
      );
    }
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
