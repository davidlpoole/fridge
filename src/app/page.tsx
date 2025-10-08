"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "fridge-items";
const API_KEY_STORAGE_KEY = "groq-api-key";
const REQUIREMENTS_STORAGE_KEY = "user-requirements";

export default function Home() {
  const [items, setItems] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [recipes, setRecipes] = useState("");
  const [loading, setLoading] = useState(false);
  const [userRequirements, setUserRequirements] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [tempApiKey, setTempApiKey] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored items:", e);
      }
    }

    const storedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }

    const storedRequirements = localStorage.getItem(REQUIREMENTS_STORAGE_KEY);
    if (storedRequirements) {
      setUserRequirements(storedRequirements);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(REQUIREMENTS_STORAGE_KEY, userRequirements);
  }, [userRequirements]);

  const addItem = () => {
    if (inputValue.trim()) {
      setItems([...items, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditingValue(items[index]);
  };

  const saveEdit = () => {
    if (editingIndex !== null && editingValue.trim()) {
      const newItems = [...items];
      newItems[editingIndex] = editingValue.trim();
      setItems(newItems);
    }
    setEditingIndex(null);
    setEditingValue("");
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingValue("");
  };

  const openSettings = () => {
    setTempApiKey(apiKey);
    setShowSettings(true);
  };

  const closeSettings = () => {
    setShowSettings(false);
    setTempApiKey("");
  };

  const saveSettings = () => {
    setApiKey(tempApiKey);
    localStorage.setItem(API_KEY_STORAGE_KEY, tempApiKey);
    setShowSettings(false);
    setTempApiKey("");
  };

  const getRecipes = async () => {
    if (items.length === 0) return;
    
    if (!apiKey) {
      setRecipes("Please set your Groq API key in settings (⚙️ icon)");
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        },
        body: JSON.stringify({ items, requirements: userRequirements }),
      });

      const data = await response.json();
      if (response.ok) {
        setRecipes(data.recipes);
      } else {
        setRecipes("Error getting recipes: " + data.error);
      }
    } catch {
      setRecipes("Error getting recipes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={openSettings} 
        className="fixed top-4 right-4 p-3 bg-olive-600 hover:bg-olive-700 text-white border-none rounded-full w-12 h-12 cursor-pointer text-xl transition-colors flex items-center justify-center shadow-lg z-50" 
        title="Settings"
      >
        ⚙️
      </button>

      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]" onClick={closeSettings}>
          <div className="bg-white p-8 rounded-2xl max-w-md w-11/12 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 m-0">Settings</h2>
              <button 
                onClick={closeSettings} 
                className="bg-transparent border-none text-2xl cursor-pointer text-gray-500 hover:text-gray-800 p-0 w-8 h-8 flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </div>
            <div className="mb-6">
              <label className="block font-medium mb-2 text-gray-800">
                Groq API Key
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="gsk_..."
                  className="w-full p-3 text-base border-2 border-gray-300 rounded-lg font-mono outline-none transition-colors focus:border-sage-500 box-border mt-2"
                />
              </label>
              <p className="text-sm text-gray-600 mt-2">
                Get your free API key from{" "}
                <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-terracotta-500 hover:underline">
                  Groq Console
                </a>
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <button 
                onClick={closeSettings} 
                className="px-6 py-3 text-base bg-gray-300 hover:bg-gray-400 text-gray-800 border-none rounded-lg cursor-pointer transition-colors font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={saveSettings} 
                className="px-6 py-3 text-base bg-sage-500 hover:bg-sage-600 text-white border-none rounded-lg cursor-pointer transition-colors font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-3xl mx-auto px-6 py-8 font-sans">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-terracotta-600 mb-2 drop-shadow-sm">🍳 Fridge Recipes</h1>
          <p className="text-xl text-gray-600 font-light">What&apos;s in your fridge and pantry?</p>
        </div>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addItem()}
          placeholder="Add an item..."
          className="flex-1 p-3 text-base border-2 border-gray-300 rounded-lg outline-none transition-colors focus:border-sage-500 focus:ring-2 focus:ring-sage-200"
        />
        <button 
          onClick={addItem} 
          className="px-6 py-3 text-base bg-sage-500 hover:bg-sage-600 text-white border-none rounded-lg cursor-pointer transition-colors font-medium shadow-sm"
        >
          Add
        </button>
      </div>

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
                  onClick={() => removeItem(index)} 
                  className="px-4 py-2 text-sm bg-terracotta-500 hover:bg-terracotta-600 text-white border-none rounded-md cursor-pointer transition-colors"
                >
                  Remove
                </button>
              </>
            )}
          </li>
        ))}
      </ul>

      {items.length === 0 && (
        <p className="text-center text-gray-500 py-8 italic bg-cream-200 rounded-lg">
          No items yet. Add something from your fridge and/or pantry!
        </p>
      )}

      {(
        <div>
          <div className="bg-cream-300 p-6 rounded-xl mb-4 shadow-sm border border-cream-400">
            <label className="block font-medium mb-3 text-gray-800">
              Dietary requirements or preferences (optional):
              <textarea
                value={userRequirements}
                onChange={(e) => setUserRequirements(e.target.value)}
                placeholder="E.g., vegetarian, gluten-free, quick meals, etc."
                rows={3}
                className="w-full p-3 text-base border-2 border-gray-300 rounded-lg resize-vertical font-sans outline-none transition-colors focus:border-sage-500 focus:ring-2 focus:ring-sage-200 box-border mt-2"
              />
            </label>
          </div>
          <button 
            onClick={getRecipes} 
            disabled={loading} 
            className="w-full p-4 text-lg bg-terracotta-500 hover:bg-terracotta-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white border-none rounded-xl cursor-pointer transition-colors font-semibold mt-2 shadow-md hover:shadow-lg"
          >
            {loading ? "Getting recipes..." : "What can I make?"}
          </button>
        </div>
      )}

      {recipes && (
        <div className="mt-8 p-6 bg-white border-2 border-sage-400 rounded-xl shadow-md">
          <h2 className="text-3xl font-bold text-terracotta-600 mb-4">Recipe Ideas:</h2>
          <pre className="whitespace-pre-wrap leading-relaxed text-gray-700 text-base font-sans">{recipes}</pre>
        </div>
      )}
      </main>
    </>
  );
}
