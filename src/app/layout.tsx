import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Costume Roaster | Get Your Halloween Costume Roasted by AI",
  description: "Upload your Halloween costume and get hilariously roasted by AI. See what your costume should have looked like with AI-generated improvements. Powered by Gemini.",
  keywords: ["Halloween", "AI", "costume roaster", "funny", "roast", "Halloween costume"],
  authors: [{ name: "Hack-or-Treat 2025" }],
};

export const viewport: Viewport = {
  themeColor: "#FF6B35",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
