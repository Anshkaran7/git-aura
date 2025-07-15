import type { Metadata } from "next";
import { Anek_Devanagari } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

const anekDevanagari = Anek_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-anek-devanagari",
});

export const metadata: Metadata = {
  title: "GitHub Profile Visualizer",
  description: "Beautiful GitHub profile and contribution visualization",
  authors: [{ name: "Your Name" }],
  keywords: [
    "GitHub",
    "Profile",
    "Contributions",
    "Visualization",
    "Developer Stats",
  ],
  openGraph: {
    title: "GitHub Profile Visualizer",
    description: "Beautiful GitHub profile and contribution visualization",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "GitHub Profile Visualizer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GitHub Profile Visualizer",
    description: "Beautiful GitHub profile and contribution visualization",
    images: ["/api/og"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${anekDevanagari.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
