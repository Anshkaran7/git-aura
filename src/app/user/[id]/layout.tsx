import { Metadata } from "next";
import { headers } from "next/headers";

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  console.log('🔍 generateMetadata called');
  
  // Try to get the URL from headers
  const headersList = await headers();
  
  // Get the full URL from various possible headers
  const fullUrl = headersList.get("x-clerk-clerk-url") || 
                  headersList.get("referer") || 
                  headersList.get("x-url") || "";
  
  console.log('📍 Full URL from headers:', fullUrl);
  
  // Parse search params from the URL
  let ogImageParam: string | null = null;
  if (fullUrl) {
    try {
      const url = new URL(fullUrl);
      ogImageParam = url.searchParams.get("og_image");
      console.log('🖼️ OG image param:', ogImageParam);
    } catch (e) {
      console.log('❌ Failed to parse URL:', e);
    }
  }
  
  // Await the promises in Next.js 15
  const resolvedParams = await params;
  const userId = resolvedParams.id;
  
  // Fix the base URL by removing quotes if they exist
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/['"]/g, '') || 'http://localhost:3000';
  
  let ogImageUrl: string;
  if (ogImageParam) {
    // Use custom uploaded OG image
    ogImageUrl = decodeURIComponent(ogImageParam);
    console.log('✅ Using custom OG image:', ogImageUrl);
  } else {
    // Use default generated OG image
    ogImageUrl = `${baseUrl}/api/og?username=${userId}`;
    console.log('🎨 Using default OG image:', ogImageUrl);
  }
  
  const metadata = {
    title: `${userId}'s GitHub Profile | GitAura`,
    description: `Check out ${userId}'s GitHub activity and aura score on GitAura`,
    openGraph: {
      title: `${userId}'s GitHub Profile | GitAura`,
      description: `Check out ${userId}'s GitHub activity and aura score on GitAura`,
      url: `${baseUrl}/user/${userId}`,
      siteName: 'GitAura',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${userId}'s GitHub Profile`,
          type: 'image/png',
        }
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${userId}'s GitHub Profile | GitAura`,
      description: `Check out ${userId}'s GitHub activity and aura score on GitAura`,
      images: [ogImageUrl],
      creator: '@GitAura',
      site: '@GitAura',
    },
  };
  
  console.log('📋 Generated metadata:', JSON.stringify(metadata, null, 2));
  return metadata;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
