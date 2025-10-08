import { useState } from "react";

interface IngredientListProps {
  items: string[];
  onRemove: (index: number) => void;
  onEdit: (index: number, newValue: string) => void;
}

export default function IngredientList({ items, onRemove, onEdit }: IngredientListProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditingValue(items[index]);
  };

  const saveEdit = () => {
    if (editingIndex !== null && editingValue.trim()) {
      onEdit(editingIndex, editingValue.trim());
    }
    setEditingIndex(null);
    setEditingValue("");
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingValue("");
  };

  if (items.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8 italic bg-cream-200 rounded-lg">
        No items yet. Add something from your fridge and/or pantry!
      </p>
    );
  }

  return (
    <ul className="list-none p-0 mb-6">
      {items.map((item, index) => (
        <li key={index} className="flex justify-between items-center p-4 mb-2 bg-white rounded-lg transition-all hover:bg-cream-200 shadow-sm">
          {editingIndex === index ? (
            <>
              <input
                type="text"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") saveEdit();
                  if (e.key === "Escape") cancelEdit();
                }}
                onBlur={saveEdit}
                className="flex-1 p-2 px-3 text-base border-2 border-gray-300 rounded-lg outline-none transition-colors focus:border-sage-500 mr-2"
                autoFocus
              />
              <button 
                onClick={saveEdit} 
                className="px-4 py-2 text-sm bg-sage-500 hover:bg-sage-600 text-white border-none rounded-md cursor-pointer transition-colors"
              >
                Save
              </button>
              <button 
                onClick={cancelEdit} 
                className="px-4 py-2 text-sm bg-terracotta-500 hover:bg-terracotta-600 text-white border-none rounded-md cursor-pointer transition-colors ml-2"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <span 
                className="flex-1 text-base text-gray-800 cursor-pointer" 
                onClick={() => startEditing(index)}
              >
                {item}
              </span>
              <button 
                onClick={() => onRemove(index)} 
                className="px-4 py-2 text-sm bg-terracotta-500 hover:bg-terracotta-600 text-white border-none rounded-md cursor-pointer transition-colors"
              >
                Remove
              </button>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
