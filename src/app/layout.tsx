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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),
  title: "Youssef Nesafe | Senior Frontend Engineer",
  description:
    "Full-stack Software Engineer with 6+ years of experience building scalable, high-performance applications. Passionate about clean code, modern architectures, and delivering innovative solutions.",
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
      "Crafting scalable, high-performance applications with 6+ years of experience in full-stack development and modern web solutions.",
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
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
