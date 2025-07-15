import type { Metadata, ResolvingMetadata } from "next";
import { Anek_Devanagari } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

const anekDevanagari = Anek_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-anek-devanagari",
});

const defaultMetadata: Metadata = {
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
};

export async function generateMetadata(
  { params, searchParams }: { params: any; searchParams: any },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const ogImage = searchParams.og_image;

  const openGraphImages = ogImage ? [{ url: ogImage }] : [];

  return {
    ...defaultMetadata,
    openGraph: {
      ...defaultMetadata.openGraph,
      images: openGraphImages,
    },
  };
}

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
