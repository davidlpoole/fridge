"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { UserProfile } from "@/lib/types";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  syncData: (items: string[], dietary: string, apiKey?: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile on mount
  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/user");
      if (response.ok) {
        const profile = await response.json();
        setUser(profile);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch("/api/auth/request-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: data.message || "Login link sent! Check your email.",
        };
      } else {
        return {
          success: false,
          message: data.error || "Failed to send login link",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "Network error. Please try again.",
      };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  const syncData = async (
    items: string[],
    dietary: string,
    apiKey?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch("/api/user/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items,
          dietary,
          groq_api_key: apiKey,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.profile);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Sync error:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, syncData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
