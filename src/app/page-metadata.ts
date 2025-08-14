import type { Metadata } from "next";

interface PageProps { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const shareId = params.share as string;
  const ogImage = params.og_image as string;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://git-aura.karandev.in";
  if (shareId) {
    const canonicalUrl = `${baseUrl}?share=${shareId}`;
    return {
      title: "GitAura - Flex your GitHub Aura",
      description: "View this beautifully visualized GitHub profile with contribution graphs, repository statistics, and developer insights.",
      authors: [{ name: "Karan Dev", url: "https://karandev.in" }],
      alternates: { canonical: canonicalUrl },
      twitter: { card: "summary_large_image", title: "GitAura - Flex your GitHub Aura", images: [{ url: ogImage || `${baseUrl}/api/og?shared=true` }] },
    };
  }
  return {
    title: "GitAura - Flex your GitHub Aura",
    description: "Create stunning visualizations of any GitHub profile.",
    twitter: { card: "summary_large_image", images: [{ url: `${baseUrl}/api/og` }] },
  };
}
