# Authentication Flow Diagrams

This document provides visual representations of the authentication flows.

## 1. Magic Link Login Flow

```
┌─────────────┐
│   User      │
│ (Browser)   │
└──────┬──────┘
       │
       │ 1. Clicks "Sign In"
       ▼
┌─────────────────────────────────────┐
│      LoginModal Component           │
│  ┌───────────────────────────────┐  │
│  │ Enter your email:             │  │
│  │ [user@example.com]            │  │
│  │ [Send Magic Link]             │  │
│  └───────────────────────────────┘  │
└──────┬──────────────────────────────┘
       │
       │ 2. Submits email
       ▼
┌─────────────────────────────────────┐
│  POST /api/auth/request-login       │
│  { email: "user@example.com" }      │
└──────┬──────────────────────────────┘
       │
       │ 3. Check rate limit
       │ 4. Generate token
       ▼
┌─────────────────────────────────────┐
│         Deno KV Storage             │
│  magic_link:abc123 → {              │
│    email: "user@...",               │
│    token: "abc123",                 │
│    expires_at: +15min               │
│  }                                  │
└──────┬──────────────────────────────┘
       │
       │ 5. Store token (15min TTL)
       ▼
┌─────────────────────────────────────┐
│      Resend Email Service           │
│  ┌───────────────────────────────┐  │
│  │ 🔐 Sign in to Fridge App      │  │
│  │                               │  │
│  │ Click to sign in:             │  │
│  │ [Sign In] ←── Magic Link      │  │
│  │                               │  │
│  │ Expires in 15 minutes         │  │
│  └───────────────────────────────┘  │
└──────┬──────────────────────────────┘
       │
       │ 6. Email sent
       ▼
┌─────────────┐
│   User      │
│ (Email)     │
└──────┬──────┘
       │
       │ 7. Clicks magic link
       ▼
┌─────────────────────────────────────┐
│  GET /api/auth/verify?token=abc123  │
└──────┬──────────────────────────────┘
       │
       │ 8. Verify token
       ▼
┌─────────────────────────────────────┐
│         Deno KV Storage             │
│  - Check token exists               │
│  - Check not expired                │
│  - Get user email                   │
│  - Delete token (one-time use!)     │
└──────┬──────────────────────────────┘
       │
       │ 9. Create JWT session
       ▼
┌─────────────────────────────────────┐
│      Session Management             │
│  session:xyz789 → {                 │
│    email: "user@...",               │
│    token: "JWT...",                 │
│    expires_at: +30days              │
│  }                                  │
└──────┬──────────────────────────────┘
       │
       │ 10. Set session cookie
       ▼
┌─────────────────────────────────────┐
│      HTTP Response                  │
│  Set-Cookie: session=JWT...;        │
│    HttpOnly; Secure; SameSite=Lax   │
│  Location: /?login=success          │
└──────┬──────────────────────────────┘
       │
       │ 11. Redirect to app
       ▼
┌─────────────────────────────────────┐
│         User (Logged In)            │
│  ✅ Session cookie stored           │
│  ✅ Access to profile                │
│  ✅ Data synced from cloud           │
└─────────────────────────────────────┘
```

---

## 2. API Key Storage & Usage Flow

### Storing API Key

```
┌─────────────┐
│   User      │
│ (Logged In) │
└──────┬──────┘
       │
       │ 1. Opens profile
       │ 2. Enters API key
       ▼
┌─────────────────────────────────────┐
│      ProfileModal Component         │
│  ┌───────────────────────────────┐  │
│  │ Groq API Key:                 │  │
│  │ [gsk_abc123...]               │  │
│  │ [Save Changes]                │  │
│  └───────────────────────────────┘  │
└──────┬──────────────────────────────┘
       │
       │ 3. Submits API key
       ▼
┌─────────────────────────────────────┐
│  PUT /api/user                      │
│  Cookie: session=JWT...             │
│  Body: {                            │
│    groq_api_key: "gsk_abc123..."    │
│  }                                  │
└──────┬──────────────────────────────┘
       │
       │ 4. Verify session
       │ 5. Encrypt API key
       ▼
┌─────────────────────────────────────┐
│      Encryption Service             │
│  Input:  "gsk_abc123..."            │
│  IV:     random 12 bytes            │
│  Key:    ENCRYPTION_KEY             │
│  Output: "encrypted_blob+iv"        │
└──────┬──────────────────────────────┘
       │
       │ 6. Store encrypted
       ▼
┌─────────────────────────────────────┐
│         Deno KV Storage             │
│  user:user@example.com → {          │
│    email: "user@...",               │
│    items: [...],                    │
│    dietary: "...",                  │
│    groq_api_key_encrypted:          │
│      "base64_encrypted_data"        │
│  }                                  │
└─────────────────────────────────────┘
```

### Using Stored API Key

```
┌─────────────┐
│   User      │
│ (Logged In) │
└──────┬──────┘
       │
       │ 1. Clicks "Get Recipes"
       ▼
┌─────────────────────────────────────┐
│  POST /api/recipes                  │
│  Cookie: session=JWT...             │
│  Body: {                            │
│    items: ["chicken", "rice"],      │
│    requirements: "vegetarian"       │
│  }                                  │
└──────┬──────────────────────────────┘
       │
       │ 2. Verify session
       ▼
┌─────────────────────────────────────┐
│      Session Verification           │
│  - Parse session cookie             │
│  - Verify JWT signature             │
│  - Get user email                   │
└──────┬──────────────────────────────┘
       │
       │ 3. Get user data
       ▼
┌─────────────────────────────────────┐
│         Deno KV Storage             │
│  user:user@example.com → {          │
│    groq_api_key_encrypted: "..."    │
│  }                                  │
└──────┬──────────────────────────────┘
       │
       │ 4. Decrypt API key
       ▼
┌─────────────────────────────────────┐
│      Decryption Service             │
│  Input:  "base64_encrypted_data"    │
│  Key:    ENCRYPTION_KEY             │
│  Output: "gsk_abc123..."            │
└──────┬──────────────────────────────┘
       │
       │ 5. Use decrypted key
       ▼
┌─────────────────────────────────────┐
│          Groq API Call              │
│  Authorization: Bearer gsk_abc123   │
│  Request: Generate recipes for      │
│           chicken, rice (vegetarian)│
└──────┬──────────────────────────────┘
       │
       │ 6. Stream response
       ▼
┌─────────────────────────────────────┐
│         User (Browser)              │
│  ✅ Recipes displayed                │
│  🔒 API key never exposed            │
└─────────────────────────────────────┘
```

---

## 3. Data Sync Flow

```
┌─────────────┐
│   User      │
│ (Anonymous) │
└──────┬──────┘
       │
       │ Has local data:
       │ - items: ["milk", "eggs"]
       │ - dietary: "vegetarian"
       │ - api_key: "gsk_123"
       │
       │ 1. Signs in via magic link
       ▼
┌─────────────────────────────────────┐
│      Auth Verification              │
│  ✅ Session created                  │
│  ✅ User logged in                   │
└──────┬──────────────────────────────┘
       │
       │ 2. Redirect to app
       ▼
┌─────────────────────────────────────┐
│      Main App (page.tsx)            │
│  - Detect login=success             │
│  - Check localStorage has data      │
│  - Show sync prompt                 │
└──────┬──────────────────────────────┘
       │
       │ 3. User clicks "Yes, Save"
       ▼
┌─────────────────────────────────────┐
│  POST /api/user/sync                │
│  Cookie: session=JWT...             │
│  Body: {                            │
│    items: ["milk", "eggs"],         │
│    dietary: "vegetarian",           │
│    groq_api_key: "gsk_123"          │
│  }                                  │
└──────┬──────────────────────────────┘
       │
       │ 4. Verify session
       │ 5. Encrypt API key
       │ 6. Merge with cloud data
       ▼
┌─────────────────────────────────────┐
│         Deno KV Storage             │
│  Before:                            │
│    items: []                        │
│    dietary: ""                      │
│                                     │
│  After:                             │
│    items: ["milk", "eggs"]          │
│    dietary: "vegetarian"            │
│    groq_api_key_encrypted: "..."    │
└──────┬──────────────────────────────┘
       │
       │ 7. Return updated profile
       ▼
┌─────────────────────────────────────┐
│         User (Browser)              │
│  ✅ Data synced to cloud             │
│  ✅ Available on all devices         │
│  ✅ Prompt dismissed                 │
└─────────────────────────────────────┘
```

---

## 4. Security Layers

```
┌──────────────────────────────────────┐
│          Security Layer 1            │
│         Rate Limiting                │
│  - 5 auth requests / 15 min          │
│  - 10 recipe requests / min          │
│  - IP-based tracking                 │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│          Security Layer 2            │
│        Magic Link Expiry             │
│  - 15-minute time window             │
│  - One-time use only                 │
│  - Automatic cleanup                 │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│          Security Layer 3            │
│         Session Security             │
│  - JWT with 30-day expiry            │
│  - httpOnly cookies                  │
│  - SameSite=Lax                      │
│  - Secure flag (production)          │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│          Security Layer 4            │
│       Data Encryption                │
│  - AES-GCM-256                       │
│  - Random IV per encryption          │
│  - API keys never plaintext          │
│  - SHA-256 key derivation            │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│          Security Layer 5            │
│       Access Control                 │
│  - User data isolated                │
│  - Session required                  │
│  - Email-scoped keys                 │
│  - No cross-user access              │
└──────────────────────────────────────┘
```

---

## 5. Component Interaction

```
┌────────────────────────────────────────────────────────┐
│                    Browser Window                       │
│                                                         │
│  ┌────────────────────────────────────────────────┐   │
│  │              AuthProvider Context              │   │
│  │  - user: UserProfile | null                    │   │
│  │  - login(email): Promise<Result>               │   │
│  │  - logout(): Promise<void>                     │   │
│  │  - syncData(...): Promise<boolean>             │   │
│  │  - refreshUser(): Promise<void>                │   │
│  └────────────┬───────────────────────────────────┘   │
│               │                                         │
│       ┌───────┴───────┬────────────┬──────────────┐   │
│       │               │            │              │   │
│       ▼               ▼            ▼              ▼   │
│  ┌─────────┐   ┌──────────┐  ┌─────────┐  ┌────────┐│
│  │ Header  │   │  Login   │  │ Profile │  │  Page  ││
│  │         │   │  Modal   │  │  Modal  │  │        ││
│  │ - Login │   │          │  │         │  │ - Sync ││
│  │ - User  │   │ - Email  │  │ - Edit  │  │ - Items││
│  │ - Logout│   │ - Submit │  │ - Delete│  │ - Recip││
│  └─────────┘   └──────────┘  └─────────┘  └────────┘│
│                                                         │
└────────────────────────────────────────────────────────┘
```

---

## Summary

The authentication system uses multiple layers of security:

1. **Rate Limiting**: Prevents brute force and abuse
2. **Magic Links**: Passwordless, time-limited, one-time use
3. **Sessions**: Secure JWT tokens with httpOnly cookies
4. **Encryption**: AES-GCM for sensitive data at rest
5. **Isolation**: Complete data separation per user

Each layer provides defense-in-depth, ensuring the system remains secure even if one layer is compromised.
