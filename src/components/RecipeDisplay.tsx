interface RecipeDisplayProps {
  recipes: string;
}

export default function RecipeDisplay({ recipes }: RecipeDisplayProps) {
  if (!recipes) return null;

  return (
    <div className="mt-8 p-6 bg-white border-2 border-sage-400 rounded-xl shadow-md">
      <h2 className="text-3xl font-bold text-terracotta-600 mb-4">Recipe Ideas:</h2>
      <pre className="whitespace-pre-wrap leading-relaxed text-gray-700 text-base font-sans">{recipes}</pre>
    </div>
  );
}
