# API Documentation

## Overview

The Fridge Recipes API is a RESTful API that provides AI-powered recipe suggestions based on available ingredients. The API uses Groq's LLaMA 3.3 70B model to generate creative recipe ideas.

## Base URL

```
http://localhost:3000/api
```

## Authentication

The API requires a Groq API key for authentication. You can provide the key in one of two ways:

1. **Header**: Include your API key in the `X-API-Key` header
2. **Environment Variable**: Set `GROQ_API_KEY` environment variable

```bash
curl -X POST http://localhost:3000/api/recipes \
  -H "X-API-Key: your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{"items": ["chicken", "rice", "broccoli"]}'
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Limit**: 10 requests per minute per IP address
- **Headers**: Rate limit information is included in response headers:
  - `X-RateLimit-Limit`: Maximum requests allowed in the window
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Time when the rate limit resets (ISO 8601)
  - `Retry-After`: Seconds to wait before retrying (only on 429 responses)

When rate limit is exceeded, the API returns a `429 Too Many Requests` response.

## Endpoints

### GET /api

Returns API information and available endpoints.

**Response:**

```json
{
  "name": "Fridge Recipes API",
  "version": "1.0.0",
  "description": "AI-powered recipe suggestion API based on available ingredients",
  "endpoints": [
    {
      "path": "/api/recipes",
      "method": "POST",
      "description": "Generate recipe suggestions based on ingredients",
      "rateLimit": "10 requests per minute per IP"
    }
  ]
}
```

### POST /api/recipes

Generates recipe suggestions based on provided ingredients.

**Request Body:**

```typescript
{
  items: string[];        // Array of ingredients (1-50 items, each 1-100 chars)
  requirements?: string;  // Optional dietary requirements/preferences (max 500 chars)
}
```

**Example Request:**

```bash
curl -X POST http://localhost:3000/api/recipes \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "items": ["chicken", "rice", "broccoli", "garlic", "soy sauce"],
    "requirements": "Quick meals under 30 minutes, Asian cuisine"
  }'
```

**Success Response (200 OK):**

```json
{
  "recipes": "1. Chicken Stir-Fry with Broccoli and Rice\n   A quick and easy Asian-inspired dish..."
}
```

**Response Headers:**
- `X-RateLimit-Limit`: 10
- `X-RateLimit-Remaining`: 9
- `X-RateLimit-Reset`: 2025-01-08T12:34:56.789Z

## Streaming Support

The API supports streaming responses for better user experience. To enable streaming, include the `Accept: text/event-stream` header:

```bash
curl -X POST http://localhost:3000/api/recipes \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{"items": ["chicken", "rice"]}'
```

The response will be streamed as the AI generates it, allowing for progressive rendering in the UI.

## Error Responses

The API returns structured error responses with detailed information:

```typescript
{
  error: string;      // Human-readable error message
  code?: string;      // Machine-readable error code
  details?: string;   // Additional error details
}
```

### Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `VALIDATION_ERROR` | Request data failed validation | 400 |
| `INVALID_REQUEST` | Malformed request (e.g., invalid JSON) | 400 |
| `API_KEY_MISSING` | API key not provided or invalid | 401 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `EXTERNAL_API_ERROR` | Error from Groq API | 500 |
| `INTERNAL_ERROR` | Unexpected server error | 500 |

### Example Error Responses

**Validation Error:**
```json
{
  "error": "Invalid request data",
  "code": "VALIDATION_ERROR",
  "details": "items: At least one item is required"
}
```

**Rate Limit Exceeded:**
```json
{
  "error": "Too many requests",
  "code": "RATE_LIMIT_EXCEEDED",
  "details": "Please wait before making another request"
}
```

**API Key Missing:**
```json
{
  "error": "API key not provided",
  "code": "API_KEY_MISSING",
  "details": "Please provide a valid Groq API key in the X-API-Key header or configure GROQ_API_KEY environment variable"
}
```

## Validation Rules

### Items Array
- **Required**: Yes
- **Type**: Array of strings
- **Min Length**: 1 item
- **Max Length**: 50 items
- **Item Constraints**: Each item must be 1-100 characters (after trimming)
- **Empty strings**: Not allowed

### Requirements String
- **Required**: No
- **Type**: String
- **Max Length**: 500 characters

## Security Features

### Prompt Injection Protection

The API implements several security measures to prevent prompt injection attacks:

1. **System Message**: Uses a system message to establish the AI's role and boundaries
2. **Input Sanitization**: Removes common prompt injection patterns from user input
3. **Input Limits**: Enforces strict length limits on all user inputs
4. **Focused Instructions**: The AI is instructed to only provide recipes and refuse off-topic requests

### Rate Limiting

Rate limiting prevents abuse and ensures fair usage across all users. Limits are applied per IP address.

### Request Size Limits

Request body size is limited to 1MB to prevent memory exhaustion attacks.

## Best Practices

1. **Handle Rate Limits**: Implement exponential backoff when you receive 429 responses
2. **Validate Input**: Validate input on the client side before sending to reduce unnecessary requests
3. **Use Streaming**: Enable streaming for better user experience in interactive applications
4. **Error Handling**: Always handle errors gracefully and provide user-friendly messages
5. **API Key Security**: Never expose your API key in client-side code or public repositories

## Examples

### Node.js/TypeScript Example

```typescript
async function getRecipes(items: string[], requirements?: string) {
  const response = await fetch('http://localhost:3000/api/recipes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.GROQ_API_KEY!,
    },
    body: JSON.stringify({ items, requirements }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`API Error: ${error.error} - ${error.details}`);
  }

  const data = await response.json();
  return data.recipes;
}

// Usage
try {
  const recipes = await getRecipes(
    ['chicken', 'rice', 'broccoli'],
    'Quick meals under 30 minutes'
  );
  console.log(recipes);
} catch (error) {
  console.error('Failed to get recipes:', error);
}
```

### Streaming Example

```typescript
async function streamRecipes(items: string[], requirements?: string) {
  const response = await fetch('http://localhost:3000/api/recipes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
      'X-API-Key': process.env.GROQ_API_KEY!,
    },
    body: JSON.stringify({ items, requirements }),
  });

  if (!response.ok) {
    throw new Error('Failed to get recipes');
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) return;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    console.log(chunk); // Process each chunk as it arrives
  }
}
```

## Support

For issues or questions:
- GitHub Issues: https://github.com/davidlpoole/fridge/issues
- API Provider (Groq): https://console.groq.com/docs
