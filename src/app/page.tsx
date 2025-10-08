"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

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
    } catch (error) {
      setRecipes("Error getting recipes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={openSettings} className={styles.settingsButton} title="Settings">
        ⚙️
      </button>

      {showSettings && (
        <div className={styles.modal} onClick={closeSettings}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Settings</h2>
              <button onClick={closeSettings} className={styles.closeButton}>×</button>
            </div>
            <div className={styles.modalBody}>
              <label className={styles.modalLabel}>
                Groq API Key
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="gsk_..."
                  className={styles.modalInput}
                />
              </label>
              <p className={styles.helpText}>
                Get your free API key from{" "}
                <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className={styles.helpLink}>
                  Groq Console
                </a>
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button onClick={closeSettings} className={styles.cancelButton}>Cancel</button>
              <button onClick={saveSettings} className={styles.saveButton}>Save</button>
            </div>
          </div>
        </div>
      )}

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>🍳 Fridge Recipes</h1>
          <p className={styles.subtitle}>What&apos;s in your fridge and pantry?</p>
        </div>

      <div className={styles.inputContainer}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addItem()}
          placeholder="Add an item..."
          className={styles.input}
        />
        <button onClick={addItem} className={styles.button}>
          Add
        </button>
      </div>

      <ul className={styles.itemList}>
        {items.map((item, index) => (
          <li key={index} className={styles.item}>
            <span className={styles.itemText}>{item}</span>
            <button onClick={() => removeItem(index)} className={styles.removeButton}>
              Remove
            </button>
          </li>
        ))}
      </ul>

      {items.length === 0 && (
        <p className={styles.emptyState}>
          No items yet. Add something from your fridge and/or pantry!
        </p>
      )}

      {(
        <div>
          <div className={styles.requirementsSection}>
            <label className={styles.label}>
              Dietary requirements or preferences (optional):
              <textarea
                value={userRequirements}
                onChange={(e) => setUserRequirements(e.target.value)}
                placeholder="E.g., vegetarian, gluten-free, quick meals, etc."
                rows={3}
                className={styles.textarea}
              />
            </label>
          </div>
          <button onClick={getRecipes} disabled={loading} className={styles.recipeButton}>
            {loading ? "Getting recipes..." : "What can I make?"}
          </button>
        </div>
      )}

      {recipes && (
        <div className={styles.recipesContainer}>
          <h2 className={styles.recipesTitle}>Recipe Ideas:</h2>
          <pre className={styles.recipesContent}>{recipes}</pre>
        </div>
      )}
      </main>
    </>
  );
}
