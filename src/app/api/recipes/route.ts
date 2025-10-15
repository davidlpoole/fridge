import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { validateRecipeRequest } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rateLimit";
import { createErrorResponse, ErrorCode, handleGroqError } from "@/lib/errors";
import { createSystemMessage, createUserPrompt } from "@/lib/prompts";
import { createRecipeSchema } from "@/lib/schemas";
import type { RecipeResponse, StructuredRecipeResponse } from "@/lib/types";

// Maximum request body size (1MB)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "1mb",
    },
  },
};

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting
    const clientIp =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const rateLimit = checkRateLimit(clientIp, 10, 60000); // 10 requests per minute

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests",
          code: ErrorCode.RATE_LIMIT_EXCEEDED,
          details: "Please wait before making another request",
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimit.limit.toString(),
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
            "X-RateLimit-Reset": new Date(rateLimit.reset).toISOString(),
            "Retry-After": Math.ceil(
              (rateLimit.reset - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    // 2. API Key Validation
    const apiKey = request.headers.get("X-API-Key") || process.env.GROQ_API_KEY;

    if (!apiKey) {
      return createErrorResponse(
        "API key not provided",
        401,
        ErrorCode.API_KEY_MISSING,
        "Please provide a valid Groq API key in the X-API-Key header or configure GROQ_API_KEY environment variable"
      );
    }

    // 3. Request Body Parsing and Validation
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return createErrorResponse(
        "Invalid JSON in request body",
        400,
        ErrorCode.INVALID_REQUEST,
        "Request body must be valid JSON"
      );
    }

    const validation = validateRecipeRequest(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return createErrorResponse(
        "Invalid request data",
        400,
        ErrorCode.VALIDATION_ERROR,
        firstError
          ? `${firstError.path.join(".")}: ${firstError.message}`
          : "Validation failed"
      );
    }

    const {
      items,
      requirements,
      mode = "default",
      numRecipes = 3,
      fullSteps = false,
    } = validation.data;

    console.log("backend: ", { mode, numRecipes, fullSteps });

    // 4. Initialize Groq client
    const groq = new Groq({
      apiKey: apiKey,
    });

    // 5. Create secure prompts with prompt injection protection
    const systemMessage = createSystemMessage(mode);
    const userPrompt = createUserPrompt(
      items,
      requirements,
      numRecipes,
      fullSteps
    );

    console.log({ systemMessage, userPrompt });

    // 6. Create JSON schema for structured output
    const recipeSchema = createRecipeSchema(numRecipes, fullSteps);

    // 7. Call Groq API with structured output (streaming disabled for structured outputs)
    // Note: Structured outputs require models that support JSON schema and work best without streaming
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemMessage,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 2048, // Increased for structured responses with multiple recipes
      response_format: {
        type: "json_schema",
        json_schema: recipeSchema,
      },
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      return NextResponse.json<RecipeResponse>(
        { recipes: { recipes: [] } },
        {
          headers: {
            "X-RateLimit-Limit": rateLimit.limit.toString(),
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
            "X-RateLimit-Reset": new Date(rateLimit.reset).toISOString(),
          },
        }
      );
    }

    // Parse the structured JSON response
    const structuredRecipes: StructuredRecipeResponse = JSON.parse(content);

    return NextResponse.json<RecipeResponse>(
      { recipes: structuredRecipes },
      {
        headers: {
          "X-RateLimit-Limit": rateLimit.limit.toString(),
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          "X-RateLimit-Reset": new Date(rateLimit.reset).toISOString(),
        },
      }
    );
  } catch (error) {
    return handleGroqError(error);
  }
}
