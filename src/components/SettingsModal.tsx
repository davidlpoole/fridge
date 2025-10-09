import { useState } from "react";

interface SettingsModalProps {
  isOpen: boolean;
  apiKey: string;
  mode: string;
  numRecipes: number;
  fullSteps: boolean;
  onClose: () => void;
  onSave: (
    apiKey: string,
    settings: { mode: string; numRecipes: number; fullSteps: boolean }
  ) => void;
}

export default function SettingsModal({
  isOpen,
  apiKey,
  mode: initialMode,
  numRecipes: initialNumRecipes,
  fullSteps: initialFullSteps,
  onClose,
  onSave,
}: SettingsModalProps) {
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [mode, setMode] = useState(initialMode ?? "default");
  const [numRecipes, setNumRecipes] = useState(initialNumRecipes ?? 3);
  const [fullSteps, setFullSteps] = useState(initialFullSteps ?? false);

  const handleSave = () => {
    onSave(tempApiKey, { mode, numRecipes, fullSteps });
  };

  const handleClose = () => {
    setTempApiKey(apiKey);
    // reset to incoming props (current saved settings)
    setMode(initialMode ?? "default");
    setNumRecipes(initialNumRecipes ?? 3);
    setFullSteps(initialFullSteps ?? false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]"
      onClick={handleClose}
    >
      <div
        className="bg-white p-8 rounded-2xl max-w-md w-11/12 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 m-0">Settings</h2>
          <button
            onClick={handleClose}
            type="button"
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
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-terracotta-500 hover:underline"
            >
              Groq Console
            </a>
          </p>
        </div>
        <div className="mb-6">
          <label className="block font-medium mb-2 text-gray-800">
            Mode
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full p-3 text-base border-2 border-gray-300 rounded-lg outline-none transition-colors focus:border-sage-500 box-border mt-2"
            >
              <option value="default">Default</option>
              <option value="friendly">Friendly</option>
              <option value="sarcasm">Sarcastic</option>
              <option value="creative">Creative</option>
              <option value="weird">Weird</option>
              <option value="funny">Funny</option>
              <option value="evil">Evil</option>
              <option value="poetic">Poetic</option>
              <option value="backpacker">Backpacker</option>
            </select>
          </label>
        </div>
        <div className="mb-6">
          <label className="block font-medium mb-2 text-gray-800">
            Number of Recipes
            <select
              value={numRecipes}
              onChange={(e) => setNumRecipes(Number(e.target.value))}
              className="w-full p-3 text-base border-2 border-gray-300 rounded-lg outline-none transition-colors focus:border-sage-500 box-border mt-2"
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </label>
        </div>
        <div className="mb-6">
          <label className="block font-medium mb-2 text-gray-800">
            Full Steps
            <input
              type="checkbox"
              checked={fullSteps}
              onChange={(e) => setFullSteps(e.target.checked)}
              className="ml-2"
            />
          </label>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={handleClose}
            type="button"
            className="px-6 py-3 text-base bg-gray-300 hover:bg-gray-400 text-gray-800 border-none rounded-lg cursor-pointer transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            type="submit"
            className="px-6 py-3 text-base bg-sage-500 hover:bg-sage-600 text-white border-none rounded-lg cursor-pointer transition-colors font-medium"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
