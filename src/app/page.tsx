"use client";

import { useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  STORAGE_KEY,
  API_KEY_STORAGE_KEY,
  REQUIREMENTS_STORAGE_KEY,
} from "@/lib/constants";
import { useAuth } from "@/contexts/AuthContext";
import SettingsModal from "@/components/SettingsModal";
import LoginModal from "@/components/LoginModal";
import ProfileModal from "@/components/ProfileModal";
import IngredientInput from "@/components/IngredientInput";
import IngredientList from "@/components/IngredientList";
import RecipeForm from "@/components/RecipeForm";
import RecipeDisplay from "@/components/RecipeDisplay";
import Header from "@/components/Header";

export default function Home() {
  const { user, login, logout, refreshUser, syncData } = useAuth();
  const [items, setItems, itemsLoading] = useLocalStorage<string[]>(
    STORAGE_KEY,
    []
  );
  const [apiKey, setApiKey] = useLocalStorage<string>(API_KEY_STORAGE_KEY, "");
  const [userRequirements, setUserRequirements] = useLocalStorage<string>(
    REQUIREMENTS_STORAGE_KEY,
    ""
  );
  const [recipes, setRecipes] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSyncButton, setShowSyncButton] = useState(false);

  // Check URL for login success/error
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const loginSuccess = params.get("login");
    const error = params.get("error");

    if (loginSuccess === "success") {
      // Refresh user data after successful login
      refreshUser().then(() => {
        // Clear URL parameters
        window.history.replaceState({}, "", window.location.pathname);
        // Show sync prompt if there's local data
        if (items.length > 0 || userRequirements || apiKey) {
          setShowSyncButton(true);
        }
      });
    }

    if (error) {
      let errorMessage = "Login failed. Please try again.";
      if (error === "invalid_or_expired_link") {
        errorMessage = "The login link is invalid or has expired. Please request a new one.";
      } else if (error === "verification_failed") {
        errorMessage = "Verification failed. Please try again.";
      }
      alert(errorMessage);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [items, userRequirements, apiKey, refreshUser]);

  // Load user's data when logged in
  useEffect(() => {
    if (user) {
      // If user has data and local storage is empty, load from user
      if (!itemsLoading && items.length === 0 && user.items.length > 0) {
        setItems(user.items);
      }
      if (!userRequirements && user.dietary) {
        setUserRequirements(user.dietary);
      }
    }
  }, [user, itemsLoading, items.length, setItems, userRequirements, setUserRequirements]);

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

  const handleSyncData = async () => {
    const success = await syncData(items, userRequirements, apiKey || undefined);
    if (success) {
      setShowSyncButton(false);
      alert("Your fridge has been saved to your account!");
    } else {
      alert("Failed to sync data. Please try again.");
    }
  };

  const handleProfileUpdate = async (dietary: string, newApiKey?: string) => {
    try {
      const response = await fetch("/api/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dietary,
          groq_api_key: newApiKey,
        }),
      });

      if (response.ok) {
        await refreshUser();
        // Update local requirements if changed
        if (dietary !== userRequirements) {
          setUserRequirements(dietary);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating profile:", error);
      return false;
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch("/api/user", {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Your account has been deleted.");
        setShowProfile(false);
        await logout();
      } else {
        alert("Failed to delete account. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account. Please try again.");
    }
  };

  const getRecipes = async () => {
    if (items.length === 0) return;

    // For authenticated users, we don't need to check for API key
    // The backend will use their stored key
    if (!user && !apiKey) {
      setRecipes("Please set your Groq API key in settings (⚙️ icon) or sign in to save your key.");
      return;
    }

    setLoading(true);
    setRecipes(""); // Clear previous recipes

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      };

      // Only send API key header if user is not authenticated
      if (!user && apiKey) {
        headers["X-API-Key"] = apiKey;
      }

      const response = await fetch("/api/recipes", {
        method: "POST",
        headers,
        body: JSON.stringify({ items, requirements: userRequirements }),
      });

      if (!response.ok) {
        const data = await response.json();
        setRecipes(
          `Error: ${data.error}${data.details ? ` - ${data.details}` : ""}`
        );
        setLoading(false);
        return;
      }

      // Check if response is streaming
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("text/event-stream")) {
        // Handle streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          setRecipes("Error: Unable to read streaming response");
          setLoading(false);
          return;
        }

        let accumulatedText = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            setLoading(false);
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          accumulatedText += chunk;
          setRecipes(accumulatedText);
        }
      } else {
        // Handle non-streaming response
        const data = await response.json();
        setRecipes(data.recipes);
        setLoading(false);
      }
    } catch (error) {
      setRecipes(
        "Error getting recipes: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
      setLoading(false);
    }
  };

  return (
    <>
      <SettingsModal
        isOpen={showSettings}
        apiKey={apiKey}
        onClose={closeSettings}
        onSave={saveSettings}
      />
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onLogin={login}
      />
      {user && (
        <ProfileModal
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
          user={user}
          onUpdate={handleProfileUpdate}
          onDelete={handleDeleteAccount}
        />
      )}
      <main className="max-w-3xl mx-auto px-6 py-8 font-sans">
        <Header onLogin={() => setShowLogin(true)} onProfile={() => setShowProfile(true)} />
        
        {/* Sync prompt for logged-in users with local data */}
        {user && showSyncButton && (
          <div className="mb-6 p-4 bg-sage-50 border-2 border-sage-300 rounded-xl">
            <p className="text-gray-700 mb-2">
              <strong>💾 Save your fridge to your account?</strong>
            </p>
            <p className="text-sm text-gray-600 mb-3">
              You have local data. Would you like to sync it to your account?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleSyncData}
                type="button"
                className="px-4 py-2 text-sm bg-sage-500 hover:bg-sage-600 text-white border-none rounded-lg cursor-pointer transition-colors font-medium"
              >
                Yes, Save My Fridge
              </button>
              <button
                onClick={() => setShowSyncButton(false)}
                type="button"
                className="px-4 py-2 text-sm bg-gray-300 hover:bg-gray-400 text-gray-800 border-none rounded-lg cursor-pointer transition-colors"
              >
                Not Now
              </button>
            </div>
          </div>
        )}

        <IngredientInput onAdd={addItem} />
        <IngredientList
          items={items}
          onRemove={removeItem}
          onEdit={editItem}
          isLoading={itemsLoading}
        />
        <div className="flex flex-col gap-4">
          <RecipeForm
            userRequirements={userRequirements}
            onRequirementsChange={setUserRequirements}
            onSubmit={getRecipes}
            loading={loading}
            hasItems={items.length > 0}
            onSettings={openSettings}
          />
          
          {/* Save/Sync button for authenticated users */}
          {user && items.length > 0 && (
            <button
              onClick={handleSyncData}
              type="button"
              className="px-6 py-3 text-base bg-terracotta-500 hover:bg-terracotta-600 text-white border-none rounded-lg cursor-pointer transition-colors font-medium"
            >
              💾 Save My Fridge
            </button>
          )}
        </div>
        <RecipeDisplay recipes={recipes} />
      </main>
    </>
  );
}
