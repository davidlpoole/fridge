"use client";

import { useState } from "react";

export default function Home() {
  const [items, setItems] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [recipes, setRecipes] = useState("");
  const [loading, setLoading] = useState(false);
  const [userRequirements, setUserRequirements] = useState("");

  const addItem = () => {
    if (inputValue.trim()) {
      setItems([...items, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const getRecipes = async () => {
    if (items.length === 0) return;
    
    setLoading(true);
    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items, requirements: userRequirements }),
      });

      const data = await response.json();
      if (response.ok) {
        setRecipes(data.recipes);
      } else {
        setRecipes("Error getting recipes: " + data.error);
      }
    } catch (error) {
      setRecipes("Error getting recipes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <h1>Hello</h1>
      <p>What's in your fridge and pantry?</p>

      <div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addItem()}
          placeholder="Add an item..."
        />
        <button onClick={addItem}>
          Add
        </button>
      </div>

      <ul>
        {items.map((item, index) => (
          <li key={index}>
            <span>{item}</span>
            <button onClick={() => removeItem(index)}>
              Remove
            </button>
          </li>
        ))}
      </ul>

      {items.length === 0 && (
        <p>
          No items yet. Add something from your fridge and/or pantry!
        </p>
      )}

      {items.length > 0 && (
        <div>
          <div>
            <label>
              Dietary requirements or preferences (optional):
              <textarea
                value={userRequirements}
                onChange={(e) => setUserRequirements(e.target.value)}
                placeholder="E.g., vegetarian, gluten-free, quick meals, etc."
                rows={3}
              />
            </label>
          </div>
          <button onClick={getRecipes} disabled={loading}>
            {loading ? "Getting recipes..." : "What can I make?"}
          </button>
        </div>
      )}

      {recipes && (
        <div>
          <h2>Recipe Ideas:</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>{recipes}</pre>
        </div>
      )}
    </main>
  );
}
