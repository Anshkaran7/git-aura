import type { Metadata } from "next";

interface PageProps {
  params: { id: string };
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  children: React.ReactNode;
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { id } = params;
  const searchParamsData = await searchParams;
  const ogImage = searchParamsData.og_image as string;

  // Base URL for your application
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

  // If we have a username, create personalized metadata
  if (id) {
    // Only use og_image if provided, no fallback to generated image
    const ogImageUrl = ogImage || `${baseUrl}/api/og`; // Default generic image
    
    return {
      title: `${id}'s GitHub Profile | GitAura`,
      description: `View ${id}'s GitHub contribution statistics, aura score, and beautiful profile visualization on GitAura.`,
      openGraph: {
        title: `${id}'s GitHub Profile | GitAura`,
        description: `View ${id}'s GitHub contribution statistics, aura score, and beautiful profile visualization on GitAura.`,
        url: `${baseUrl}/user/${id}`,
        siteName: 'GitAura',
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `${id}'s GitHub Profile Visualization`,
          },
        ],
        locale: 'en_US',
        type: 'profile',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${id}'s GitHub Profile | GitAura`,
        description: `View ${id}'s GitHub contribution statistics, aura score, and beautiful profile visualization on GitAura.`,
        images: [ogImageUrl],
        creator: '@GitAura',
        site: '@GitAura',
      },
      alternates: {
        canonical: `${baseUrl}/user/${id}`,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  }

  // Default metadata
  return {
    title: "GitAura - GitHub Profile Visualizer",
    description: "Beautiful GitHub profile and contribution visualization with aura scoring",
    openGraph: {
      title: "GitAura - GitHub Profile Visualizer",
      description: "Beautiful GitHub profile and contribution visualization with aura scoring",
      url: baseUrl,
      siteName: 'GitAura',
      images: [
        {
          url: `${baseUrl}/api/og`,
          width: 1200,
          height: 630,
          alt: "GitAura - GitHub Profile Visualizer",
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: "summary_large_image",
      title: "GitAura - GitHub Profile Visualizer",
      description: "Beautiful GitHub profile and contribution visualization with aura scoring",
      images: [`${baseUrl}/api/og`],
      creator: '@GitAura',
      site: '@GitAura',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default function Layout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return children
}
