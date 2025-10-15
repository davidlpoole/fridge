"use client";

import { useEffect } from "react";

export default function PWARegister() {
  useEffect(() => {
    try {
      if (
        typeof window !== "undefined" &&
        "serviceWorker" in navigator &&
        process.env.NODE_ENV === "production"
      ) {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("Service Worker registered:", registration);
          })
          .catch((error) => {
            console.error("Service Worker registration failed:", error);
          });
      }
    } catch (error) {
      console.error("Error during service worker registration:", error);
    }
  }, []);

  return null;
}
