"use client";

import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  onLogin: () => void;
  onProfile: () => void;
}

export default function Header({ onLogin, onProfile }: HeaderProps) {
  const { user, loading, logout } = useAuth();

  return (
    <div className="mb-8">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1"></div>
        <div className="flex-1 flex justify-center">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-terracotta-600 mb-2 drop-shadow-sm">
              🍽 🤷 🥗
            </h1>
            <p className="text-xl text-gray-600 font-light">
              Transform your ingredients into delicious meals
            </p>
          </div>
        </div>
        <div className="flex-1 flex justify-end">
          {!loading && (
            <>
              {user ? (
                <div className="flex gap-2 items-start">
                  <button
                    onClick={onProfile}
                    type="button"
                    className="px-4 py-2 text-sm bg-sage-500 hover:bg-sage-600 text-white border-none rounded-lg cursor-pointer transition-colors font-medium"
                    title="My Profile"
                  >
                    👤 {user.email.split("@")[0]}
                  </button>
                  <button
                    onClick={logout}
                    type="button"
                    className="px-3 py-2 text-sm bg-gray-300 hover:bg-gray-400 text-gray-800 border-none rounded-lg cursor-pointer transition-colors"
                    title="Logout"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={onLogin}
                  type="button"
                  className="px-4 py-2 text-sm bg-sage-500 hover:bg-sage-600 text-white border-none rounded-lg cursor-pointer transition-colors font-medium"
                >
                  Sign In / Sign Up
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
