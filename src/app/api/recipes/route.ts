import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { items } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No items provided" },
        { status: 400 }
      );
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `I have the following ingredients: ${items.join(", ")}. Suggest 3 simple recipes I can make with these ingredients. For each recipe, provide the name and a brief description. Format your response as a list.`,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
    });

    const recipes = completion.choices[0]?.message?.content || "No recipes found.";

    return NextResponse.json({ recipes });
  } catch (error) {
    console.error("Error calling Groq API:", error);
    return NextResponse.json(
      { error: "Failed to get recipes" },
      { status: 500 }
    );
  }
}
