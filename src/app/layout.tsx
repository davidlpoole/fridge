import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fridge Recipes - What Can I Make?",
  description: "Enter ingredients from your fridge and pantry to discover delicious recipe ideas powered by AI.",
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
      </body>
    </html>
  );
}
