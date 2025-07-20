import { Metadata } from "next";
import { headers } from "next/headers";

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  // Try to get the URL from headers
  const headersList = await headers();
  
  // Get the full URL from various possible headers
  const fullUrl = headersList.get("x-clerk-clerk-url") || 
                  headersList.get("referer") || 
                  headersList.get("x-url") || "";
  
  // Parse search params from the URL
  let ogImageParam: string | null = null;
  if (fullUrl) {
    try {
      const url = new URL(fullUrl);
      ogImageParam = url.searchParams.get("og_image");
    } catch (e) {
      // Ignore URL parsing errors
    }
  }
  
  // Await the promises in Next.js 15
  const resolvedParams = await params;
  const userId = resolvedParams.id;
  
  let ogImageUrl: string;
  if (ogImageParam) {
    // Use custom uploaded OG image
    ogImageUrl = decodeURIComponent(ogImageParam);
  } else {
    // Use default generated OG image
    ogImageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/og?username=${userId}`;
  }
  
  return {
    title: `${userId}'s GitHub Profile | GitAura`,
    openGraph: {
      images: [{ url: ogImageUrl }],
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
