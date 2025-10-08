import { useState } from "react";

interface IngredientInputProps {
  onAdd: (item: string) => void;
}

export default function IngredientInput({ onAdd }: IngredientInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue("");
    }
  };

  return (
    <div className="flex gap-2 mb-6">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && handleAdd()}
        placeholder="Add an item..."
        className="flex-1 p-3 text-base border-2 border-gray-300 rounded-lg outline-none transition-colors focus:border-sage-500 focus:ring-2 focus:ring-sage-200"
      />
      <button 
        onClick={handleAdd} 
        className="px-6 py-3 text-base bg-sage-500 hover:bg-sage-600 text-white border-none rounded-lg cursor-pointer transition-colors font-medium shadow-sm"
      >
        Add
      </button>
    </div>
  );
}
