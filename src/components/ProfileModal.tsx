import { useState } from "react";
import type { UserProfile } from "@/lib/types";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdate: (dietary: string, apiKey?: string) => Promise<boolean>;
  onDelete: () => Promise<void>;
}

export default function ProfileModal({
  isOpen,
  onClose,
  user,
  onUpdate,
  onDelete,
}: ProfileModalProps) {
  const [dietary, setDietary] = useState(user.dietary);
  const [apiKey, setApiKey] = useState("");
  const [removeApiKey, setRemoveApiKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);

    const keyToUpdate = removeApiKey ? "" : apiKey || undefined;
    const success = await onUpdate(dietary, keyToUpdate);

    setLoading(false);

    if (success) {
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setApiKey("");
      setRemoveApiKey(false);
      setTimeout(() => {
        onClose();
        setMessage(null);
      }, 1500);
    } else {
      setMessage({ type: "error", text: "Failed to update profile. Please try again." });
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    await onDelete();
    setLoading(false);
    setShowDeleteConfirm(false);
  };

  const handleClose = () => {
    setDietary(user.dietary);
    setApiKey("");
    setRemoveApiKey(false);
    setShowDeleteConfirm(false);
    setMessage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]"
      onClick={handleClose}
    >
      <div
        className="bg-white p-8 rounded-2xl max-w-md w-11/12 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 m-0">My Profile</h2>
          <button
            onClick={handleClose}
            type="button"
            className="bg-transparent border-none text-2xl cursor-pointer text-gray-500 hover:text-gray-800 p-0 w-8 h-8 flex items-center justify-center transition-colors"
          >
            ×
          </button>
        </div>

        {/* Email (read-only) */}
        <div className="mb-4">
          <label className="block font-medium mb-2 text-gray-800">
            Email
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full p-3 text-base border-2 border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed box-border mt-2 text-gray-600"
            />
          </label>
        </div>

        {/* Dietary Requirements */}
        <div className="mb-4">
          <label className="block font-medium mb-2 text-gray-800">
            Dietary Requirements / Preferences
            <textarea
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              placeholder="E.g., vegetarian, gluten-free, quick meals, etc."
              rows={3}
              disabled={loading}
              className="w-full p-3 text-base border-2 border-gray-300 rounded-lg outline-none transition-colors focus:border-sage-500 box-border mt-2 resize-y disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </label>
        </div>

        {/* Groq API Key */}
        <div className="mb-4">
          <label className="block font-medium mb-2 text-gray-800">
            Groq API Key
            {user.has_api_key && !removeApiKey && (
              <span className="ml-2 text-sm text-green-600">✓ Stored</span>
            )}
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setRemoveApiKey(false);
              }}
              placeholder={user.has_api_key ? "Enter new key to update" : "gsk_..."}
              disabled={loading || removeApiKey}
              className="w-full p-3 text-base border-2 border-gray-300 rounded-lg font-mono outline-none transition-colors focus:border-sage-500 box-border mt-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </label>
          <p className="text-sm text-gray-600 mt-1">
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
          {user.has_api_key && (
            <label className="flex items-center mt-2 text-sm">
              <input
                type="checkbox"
                checked={removeApiKey}
                onChange={(e) => {
                  setRemoveApiKey(e.target.checked);
                  if (e.target.checked) {
                    setApiKey("");
                  }
                }}
                disabled={loading}
                className="mr-2"
              />
              Remove stored API key
            </label>
          )}
        </div>

        {message && (
          <div
            className={`p-3 mb-4 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end mb-4">
          <button
            onClick={handleClose}
            type="button"
            disabled={loading}
            className="px-6 py-3 text-base bg-gray-300 hover:bg-gray-400 text-gray-800 border-none rounded-lg cursor-pointer transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            type="button"
            disabled={loading}
            className="px-6 py-3 text-base bg-sage-500 hover:bg-sage-600 text-white border-none rounded-lg cursor-pointer transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Delete Account */}
        <div className="pt-4 border-t border-gray-200">
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              type="button"
              disabled={loading}
              className="text-sm text-red-600 hover:text-red-800 underline bg-transparent border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete my account
            </button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 mb-3 font-medium">
                Are you sure? This will permanently delete your account and all saved data.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  type="button"
                  disabled={loading}
                  className="px-4 py-2 text-sm bg-gray-300 hover:bg-gray-400 text-gray-800 border-none rounded-lg cursor-pointer transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  type="button"
                  disabled={loading}
                  className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white border-none rounded-lg cursor-pointer transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Deleting..." : "Yes, Delete My Account"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
