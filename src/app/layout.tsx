import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dinosaur App",
  description: "Run Next.js with Deno",
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
