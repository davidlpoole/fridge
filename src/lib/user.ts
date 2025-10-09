// User data management utilities
import { getKv, KV_KEYS } from "./kv";
import { encrypt, decrypt } from "./encryption";
import type { UserData, UserProfile } from "./types";

/**
 * Get user data from KV
 */
export async function getUserData(email: string): Promise<UserData | null> {
  const kv = await getKv();
  const result = await kv.get<UserData>([KV_KEYS.USER, email]);
  return result.value;
}

/**
 * Create a new user account
 */
export async function createUser(email: string): Promise<UserData> {
  const kv = await getKv();
  const now = Date.now();

  const userData: UserData = {
    email,
    items: [],
    dietary: "",
    created_at: now,
    updated_at: now,
  };

  await kv.set([KV_KEYS.USER, email], userData);
  return userData;
}

/**
 * Update user data
 */
export async function updateUser(
  email: string,
  updates: Partial<Omit<UserData, "email" | "created_at">>
): Promise<UserData | null> {
  const kv = await getKv();
  const existing = await getUserData(email);

  if (!existing) {
    return null;
  }

  const updated: UserData = {
    ...existing,
    ...updates,
    updated_at: Date.now(),
    email, // Ensure email doesn't change
    created_at: existing.created_at, // Ensure created_at doesn't change
  };

  await kv.set([KV_KEYS.USER, email], updated);
  return updated;
}

/**
 * Delete user account and all associated data
 */
export async function deleteUser(email: string): Promise<boolean> {
  const kv = await getKv();
  const existing = await getUserData(email);

  if (!existing) {
    return false;
  }

  await kv.delete([KV_KEYS.USER, email]);
  return true;
}

/**
 * Get user profile (without sensitive data)
 */
export function getUserProfile(userData: UserData): UserProfile {
  return {
    email: userData.email,
    items: userData.items,
    dietary: userData.dietary,
    has_api_key: !!userData.groq_api_key_encrypted,
  };
}

/**
 * Store encrypted API key for user
 */
export async function storeUserApiKey(
  email: string,
  apiKey: string
): Promise<void> {
  const encrypted = await encrypt(apiKey);
  await updateUser(email, {
    groq_api_key_encrypted: encrypted,
  });
}

/**
 * Get decrypted API key for user
 */
export async function getUserApiKey(email: string): Promise<string | null> {
  const userData = await getUserData(email);
  
  if (!userData || !userData.groq_api_key_encrypted) {
    return null;
  }

  try {
    return await decrypt(userData.groq_api_key_encrypted);
  } catch (error) {
    console.error("Failed to decrypt user API key:", error);
    return null;
  }
}

/**
 * Remove API key from user profile
 */
export async function removeUserApiKey(email: string): Promise<void> {
  await updateUser(email, {
    groq_api_key_encrypted: undefined,
  });
}

/**
 * Sync local data to user profile
 */
export async function syncUserData(
  email: string,
  items: string[],
  dietary: string,
  apiKey?: string
): Promise<UserData> {
  const updates: Partial<Omit<UserData, "email" | "created_at">> = {
    items,
    dietary,
  };

  // Encrypt API key if provided
  if (apiKey) {
    updates.groq_api_key_encrypted = await encrypt(apiKey);
  }

  // Get or create user
  let user = await getUserData(email);
  if (!user) {
    user = await createUser(email);
  }

  // Update with synced data
  const updated = await updateUser(email, updates);
  
  if (!updated) {
    throw new Error("Failed to sync user data");
  }

  return updated;
}
