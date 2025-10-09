import { useEffect, useRef } from "react";

interface RecipeDisplayProps {
  recipes: string;
}

export default function RecipeDisplay({ recipes }: RecipeDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (recipes && containerRef.current) {
      // Smooth scroll to the bottom of the container
      containerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [recipes]);

  if (!recipes) return null;

  return (
    <div
      ref={containerRef}
      className="mt-8 p-6 bg-white border-2 border-sage-400 rounded-xl shadow-md"
    >
      <h2 className="text-3xl font-bold text-terracotta-600 mb-4 text-center">
        🤖
      </h2>
      <pre className="whitespace-pre-wrap leading-relaxed text-gray-700 text-base font-sans">
        {recipes}
      </pre>
    </div>
  );
}
