import { useState } from "react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string) => Promise<{ success: boolean; message: string }>;
}

export default function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const result = await onLogin(email);

    setLoading(false);

    if (result.success) {
      setMessage({ type: "success", text: result.message });
      setEmail("");
      // Close modal after showing success message for 2 seconds
      setTimeout(() => {
        onClose();
        setMessage(null);
      }, 2000);
    } else {
      setMessage({ type: "error", text: result.message });
    }
  };

  const handleClose = () => {
    setEmail("");
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
        className="bg-white p-8 rounded-2xl max-w-md w-11/12 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 m-0">Sign In / Sign Up</h2>
          <button
            onClick={handleClose}
            type="button"
            className="bg-transparent border-none text-2xl cursor-pointer text-gray-500 hover:text-gray-800 p-0 w-8 h-8 flex items-center justify-center transition-colors"
          >
            ×
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Enter your email address and we&apos;ll send you a magic link to sign in. No password needed!
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block font-medium mb-2 text-gray-800">
              Email Address
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={loading}
                className="w-full p-3 text-base border-2 border-gray-300 rounded-lg outline-none transition-colors focus:border-sage-500 box-border mt-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </label>
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

          <div className="flex gap-2 justify-end">
            <button
              onClick={handleClose}
              type="button"
              disabled={loading}
              className="px-6 py-3 text-base bg-gray-300 hover:bg-gray-400 text-gray-800 border-none rounded-lg cursor-pointer transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !email}
              className="px-6 py-3 text-base bg-sage-500 hover:bg-sage-600 text-white border-none rounded-lg cursor-pointer transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Magic Link"}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            By signing in, you agree to save your fridge items and preferences securely in the cloud.
            Your data is encrypted and private to you.
          </p>
        </div>
      </div>
    </div>
  );
}
