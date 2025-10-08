interface RecipeFormProps {
  userRequirements: string;
  onRequirementsChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  hasItems: boolean;
}

export default function RecipeForm({ 
  userRequirements, 
  onRequirementsChange, 
  onSubmit, 
  loading,
  hasItems
}: RecipeFormProps) {
  return (
    <div>
      <div className="bg-cream-300 p-6 rounded-xl mb-4 shadow-sm border border-cream-400">
        <label className="block font-medium mb-3 text-gray-800">
          Dietary requirements or preferences (optional):
          <textarea
            value={userRequirements}
            onChange={(e) => onRequirementsChange(e.target.value)}
            placeholder="E.g., vegetarian, gluten-free, quick meals, etc."
            rows={3}
            className="w-full p-3 text-base border-2 border-gray-300 rounded-lg resize-vertical font-sans outline-none transition-colors focus:border-sage-500 focus:ring-2 focus:ring-sage-200 box-border mt-2"
          />
        </label>
      </div>
      <button 
        onClick={onSubmit} 
        disabled={loading || !hasItems} 
        className="w-full p-4 text-lg bg-terracotta-500 hover:bg-terracotta-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white border-none rounded-xl cursor-pointer transition-colors font-semibold mt-2 shadow-md hover:shadow-lg"
      >
        {loading ? "Getting recipes..." : "What can I make?"}
      </button>
    </div>
  );
}
