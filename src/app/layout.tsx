import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Lettertypes staan lokaal (OFL-licenties in ./fonts): geen verzoeken naar Google, beter voor de privacy.
const oswald = localFont({ src: "./fonts/Oswald.woff2", weight: "200 700", variable: "--font-oswald", display: "swap" });
const sourceSans = localFont({ src: "./fonts/SourceSans3.woff2", weight: "200 900", variable: "--font-source-sans", display: "swap" });

export const metadata: Metadata = {
  title: "CYD Coach",
  description: "Coachomgeving van Choose Your Diet",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl" className={`${oswald.variable} ${sourceSans.variable}`}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
