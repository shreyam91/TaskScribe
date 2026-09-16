import type { Metadata } from "next";
import { Newsreader, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const ORIGIN_URL =
  process.env.NODE === "production"
    ? "https://taskscribe.ai"
    : "http://localhost:3000";

export const metadata: Metadata = {
  title: "TaskScribe",
  description:
    "TaskScribe helps you organize your tasks and stay focused on what matters.",
  icons: {},
  metadataBase: new URL(ORIGIN_URL),
  alternates: {
    canonical: ORIGIN_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${newsreader.variable} ${inter.variable} font-sans`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
