"use client";

import { useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEY, API_KEY_STORAGE_KEY, REQUIREMENTS_STORAGE_KEY } from "@/lib/constants";
import SettingsButton from "@/components/SettingsButton";
import SettingsModal from "@/components/SettingsModal";
import IngredientInput from "@/components/IngredientInput";
import IngredientList from "@/components/IngredientList";
import RecipeForm from "@/components/RecipeForm";
import RecipeDisplay from "@/components/RecipeDisplay";

export default function Home() {
  const [items, setItems] = useLocalStorage<string[]>(STORAGE_KEY, []);
  const [apiKey, setApiKey] = useLocalStorage<string>(API_KEY_STORAGE_KEY, "");
  const [userRequirements, setUserRequirements] = useLocalStorage<string>(REQUIREMENTS_STORAGE_KEY, "");
  const [recipes, setRecipes] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const addItem = (item: string) => {
    setItems([...items, item]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const editItem = (index: number, newValue: string) => {
    const newItems = [...items];
    newItems[index] = newValue;
    setItems(newItems);
  };

  const openSettings = () => {
    setShowSettings(true);
  };

  const closeSettings = () => {
    setShowSettings(false);
  };

  const saveSettings = (newApiKey: string) => {
    setApiKey(newApiKey);
    setShowSettings(false);
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
      <SettingsButton onClick={openSettings} />
      <SettingsModal 
        isOpen={showSettings}
        apiKey={apiKey}
        onClose={closeSettings}
        onSave={saveSettings}
      />
      <main className="max-w-3xl mx-auto px-6 py-8 font-sans">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-terracotta-600 mb-2 drop-shadow-sm">🍳 Fridge Recipes</h1>
          <p className="text-xl text-gray-600 font-light">What&apos;s in your fridge and pantry?</p>
        </div>

        <IngredientInput onAdd={addItem} />
        <IngredientList 
          items={items}
          onRemove={removeItem}
          onEdit={editItem}
        />
        <RecipeForm 
          userRequirements={userRequirements}
          onRequirementsChange={setUserRequirements}
          onSubmit={getRecipes}
          loading={loading}
          hasItems={items.length > 0}
        />
        <RecipeDisplay recipes={recipes} />
      </main>
    </>
  );
}
