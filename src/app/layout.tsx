import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fridge Recipes - AI-Powered Recipe Ideas",
  description: "Transform ingredients from your fridge and pantry into delicious recipes. Get AI-powered recipe suggestions tailored to what you have on hand.",
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
        {children}
        <footer className="text-center py-4 text-sm text-gray-500">
          © {new Date().getFullYear()} <a href="https://github.com/davidlpoole" target="_blank" rel="noopener noreferrer" className="hover:text-terracotta-600 transition-colors">davidlpoole</a>
        </footer>
      </body>
    </html>
  );
}
