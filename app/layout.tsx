import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Hanken_Grotesk,
  Noto_Nastaliq_Urdu,
} from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

// Cormorant Garamond 600 — the name and page titles only.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-cormorant",
  display: "swap",
});

// Hanken Grotesk 400/500 — everything else (nav, body, links).
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-hanken",
  display: "swap",
});

// Noto Nastaliq Urdu 400 — all Urdu, always lang="ur" dir="rtl".
const nastaliq = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  weight: ["400"],
  variable: "--font-nastaliq",
  display: "swap",
});

export const metadata: Metadata = {
  title: "abdullah khan",
  description:
    "builds things that feel like something. cs at uwaterloo, bba at laurier.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${hanken.variable} ${nastaliq.variable} h-full`}
    >
      <body className="min-h-full">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
