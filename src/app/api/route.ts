import { NextResponse } from "next/server";

interface ApiInfo {
  name: string;
  version: string;
  description: string;
  endpoints: {
    path: string;
    method: string;
    description: string;
    rateLimit?: string;
  }[];
}

export function GET() {
  const apiInfo: ApiInfo = {
    name: "Fridge Recipes API",
    version: "1.0.0",
    description: "AI-powered recipe suggestion API based on available ingredients",
    endpoints: [
      {
        path: "/api/recipes",
        method: "POST",
        description: "Generate recipe suggestions based on ingredients",
        rateLimit: "10 requests per minute per IP",
      },
    ],
  };

  return NextResponse.json(apiInfo, {
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  });
}
