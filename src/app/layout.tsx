import type { Metadata, Viewport } from "next";
import "./globals.css";
import PWARegister from "@/components/PWARegister";

export const metadata: Metadata = {
  title: "What To Cook: AI-Powered Recipe Ideas",
  description: "Transform ingredients from your fridge and pantry into delicious recipes. Get AI-powered recipe suggestions tailored to what you have on hand.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "What To Cook",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#D2691E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
      </head>
      <body>
        <PWARegister />
        {children}
        <footer className="text-center py-4 text-sm text-gray-500">
          © {new Date().getFullYear()} <a href="https://github.com/davidlpoole" target="_blank" rel="noopener noreferrer" className="hover:text-terracotta-600 transition-colors">davidlpoole</a>
        </footer>
      </body>
    </html>
  );
}
