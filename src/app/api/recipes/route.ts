import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { validateRecipeRequest } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rateLimit";
import { createErrorResponse, ErrorCode, handleGroqError } from "@/lib/errors";
import { createSystemMessage, createUserPrompt } from "@/lib/prompts";
import type { RecipeResponse } from "@/lib/types";

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
    const clientIp = request.headers.get("x-forwarded-for") || 
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
            "Retry-After": Math.ceil((rateLimit.reset - Date.now()) / 1000).toString(),
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
        firstError ? `${firstError.path.join(".")}: ${firstError.message}` : "Validation failed"
      );
    }

    const { items, requirements } = validation.data;

    // 4. Initialize Groq client
    const groq = new Groq({
      apiKey: apiKey,
    });

    // 5. Create secure prompts with prompt injection protection
    const systemMessage = createSystemMessage();
    const userPrompt = createUserPrompt(items, requirements);

    // 6. Check if streaming is requested
    const acceptHeader = request.headers.get("accept");
    const wantsStream = acceptHeader?.includes("text/event-stream");

    if (wantsStream) {
      // Streaming response for better UX
      const stream = await groq.chat.completions.create({
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
        max_tokens: 1024,
        stream: true,
      });

      // Create a ReadableStream for the response
      const encoder = new TextEncoder();
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || "";
              if (content) {
                controller.enqueue(encoder.encode(content));
              }
            }
            controller.close();
          } catch (error) {
            console.error("Streaming error:", error);
            controller.error(error);
          }
        },
      });

      return new Response(readableStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "X-RateLimit-Limit": rateLimit.limit.toString(),
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          "X-RateLimit-Reset": new Date(rateLimit.reset).toISOString(),
        },
      });
    }

    // 7. Non-streaming response (default)
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
      max_tokens: 1024,
    });

    const recipes = completion.choices[0]?.message?.content || "No recipes found.";

    return NextResponse.json<RecipeResponse>(
      { recipes },
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
