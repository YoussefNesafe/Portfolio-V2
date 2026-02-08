import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./styles/tailwind.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Youssef Nesafe | Senior Frontend Engineer",
  description:
    "Senior Frontend Engineer with 6+ years of experience building high-performance trading platforms and enterprise applications. Expert in React, TypeScript, and modern frontend architecture.",
  keywords: [
    "Frontend Engineer",
    "React Developer",
    "TypeScript",
    "Trading Platforms",
    "Dubai",
    "Youssef Nesafe",
  ],
  authors: [{ name: "Youssef Nesafe" }],
  openGraph: {
    title: "Youssef Nesafe | Senior Frontend Engineer",
    description:
      "Building high-performance trading platforms and enterprise applications with 6+ years of React expertise.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
