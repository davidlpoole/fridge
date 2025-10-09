// Rate limiting for authentication endpoints
import { getKv, KV_KEYS } from "./kv";

const AUTH_RATE_LIMIT = 5; // Max requests
const AUTH_RATE_WINDOW = 15 * 60 * 1000; // 15 minutes

interface AuthRateLimitData {
  count: number;
  reset_at: number;
}

/**
 * Check and update rate limit for authentication requests
 */
export async function checkAuthRateLimit(identifier: string): Promise<{
  allowed: boolean;
  remaining: number;
  reset_at: number;
}> {
  const kv = await getKv();
  const key = [KV_KEYS.RATE_LIMIT, "auth", identifier];
  
  const result = await kv.get<AuthRateLimitData>(key);
  const now = Date.now();

  if (!result.value) {
    // First request
    const data: AuthRateLimitData = {
      count: 1,
      reset_at: now + AUTH_RATE_WINDOW,
    };
    
    await kv.set(key, data, { expireIn: AUTH_RATE_WINDOW });
    
    return {
      allowed: true,
      remaining: AUTH_RATE_LIMIT - 1,
      reset_at: data.reset_at,
    };
  }

  const data = result.value;

  // Check if window has expired
  if (data.reset_at < now) {
    // Reset the counter
    const newData: AuthRateLimitData = {
      count: 1,
      reset_at: now + AUTH_RATE_WINDOW,
    };
    
    await kv.set(key, newData, { expireIn: AUTH_RATE_WINDOW });
    
    return {
      allowed: true,
      remaining: AUTH_RATE_LIMIT - 1,
      reset_at: newData.reset_at,
    };
  }

  // Check if limit exceeded
  if (data.count >= AUTH_RATE_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      reset_at: data.reset_at,
    };
  }

  // Increment counter
  data.count += 1;
  await kv.set(key, data, { expireIn: data.reset_at - now });

  return {
    allowed: true,
    remaining: AUTH_RATE_LIMIT - data.count,
    reset_at: data.reset_at,
  };
}

/**
 * Get client identifier for rate limiting (IP address)
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from headers (for proxies/load balancers)
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback to direct connection (may not work in all environments)
  return "unknown";
}
