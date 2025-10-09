// Encryption utilities for sensitive data
// Uses Web Crypto API for encryption/decryption

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const IV_LENGTH = 12;

/**
 * Get the encryption key from environment variable
 */
function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is not set");
  }
  return key;
}

/**
 * Derive a CryptoKey from the encryption key string
 */
async function deriveKey(keyString: string): Promise<CryptoKey> {
  // Hash the key string to get consistent length
  const encoder = new TextEncoder();
  const keyData = encoder.encode(keyString);
  const hashBuffer = await crypto.subtle.digest("SHA-256", keyData);

  return crypto.subtle.importKey(
    "raw",
    hashBuffer,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt a string value
 * Returns base64-encoded encrypted data with IV prepended
 */
export async function encrypt(plaintext: string): Promise<string> {
  try {
    const keyString = getEncryptionKey();
    const key = await deriveKey(keyString);

    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);

    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    // Encrypt the data
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv: iv,
      },
      key,
      data
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedData), iv.length);

    // Convert to base64
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt data");
  }
}

/**
 * Decrypt an encrypted string
 * Expects base64-encoded data with IV prepended
 */
export async function decrypt(encryptedData: string): Promise<string> {
  try {
    const keyString = getEncryptionKey();
    const key = await deriveKey(keyString);

    // Decode from base64
    const combined = Uint8Array.from(atob(encryptedData), (c) =>
      c.charCodeAt(0)
    );

    // Extract IV and encrypted data
    const iv = combined.slice(0, IV_LENGTH);
    const data = combined.slice(IV_LENGTH);

    // Decrypt the data
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: iv,
      },
      key,
      data
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data");
  }
}

/**
 * Check if encryption is configured
 */
export function isEncryptionConfigured(): boolean {
  return !!process.env.ENCRYPTION_KEY;
}
