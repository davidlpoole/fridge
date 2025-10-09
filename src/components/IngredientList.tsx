import { useState } from "react";

interface IngredientListProps {
  items: string[];
  onRemove: (index: number) => void;
  onEdit: (index: number, newValue: string) => void;
  isLoading?: boolean;
}

function ShimmerItem() {
  return (
    <li className="flex justify-between items-center p-4 mb-2 bg-white rounded-lg shadow-sm animate-pulse">
      <div className="flex-1 h-6 bg-gray-200 rounded"></div>
      <div className="w-20 h-9 bg-gray-200 rounded ml-4"></div>
    </li>
  );
}

export default function IngredientList({
  items,
  onRemove,
  onEdit,
  isLoading = false,
}: IngredientListProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditingValue(items[index]);
  };

  const saveEdit = () => {
    if (editingIndex !== null) {
      if (!editingValue.trim()) {
        onRemove(editingIndex);
      } else {
        onEdit(editingIndex, editingValue.trim());
      }
    }
    setEditingIndex(null);
    setEditingValue("");
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingValue("");
  };

  if (isLoading) {
    return (
      <ul className="list-none p-0 mb-6">
        <ShimmerItem />
        <ShimmerItem />
        <ShimmerItem />
      </ul>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8 italic bg-cream-200 rounded-lg">
        No items yet. Add something from your fridge and/or pantry!
      </p>
    );
  }

  // Updated the Remove button to only show on hover
  return (
    <ul className="list-none p-0 mb-6">
      {items.map((item, index) => (
        <li
          key={index}
          className="flex justify-between items-center p-4 mb-2 bg-white rounded-lg transition-all hover:bg-cream-200 shadow-sm group"
        >
          {editingIndex === index ? (
            <>
              <input
                type="text"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveEdit();
                  if (e.key === "Escape") cancelEdit();
                }}
                onBlur={saveEdit}
                className="flex-1 px-2 text-base border-2 border-gray-300 rounded-lg outline-none transition-colors focus:border-sage-500"
                autoFocus
              />
              {/* <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 text-sm bg-terracotta-500 hover:bg-terracotta-600 text-white border-none rounded-md cursor-pointer transition-colors ml-2"
              >
                Cancel
              </button> */}
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
                type="button"
                onClick={() => onRemove(index)}
                className="text-sm text-terracotta-500 transition-colors hidden group-hover:block"
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
