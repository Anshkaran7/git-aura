import type { Metadata } from "next";
import {
  Header,
  HeroSection,
  FeaturesSection,
  HowItWorks,
  SocialProof,
  Footer,
} from "@/components/home";
import TopAuraUsers from "@/components/animated-tooltip-demo";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const shareId = params.share as string;
  const ogImage = params.og_image as string;

  // Base URL for canonical and OG URLs
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://git-aura.karandev.in";

  // Enhanced shared profile metadata
  if (shareId) {
    const canonicalUrl = `${baseUrl}?share=${shareId}`;

    return {
      title: "GitAura - Shared Profile | Developer Stats & Contributions",
      description:
        "View this beautifully visualized GitHub profile with contribution graphs, repository statistics, and developer insights. Share and showcase your GitHub journey.",
      keywords: [
        "GitHub profile",
        "shared profile",
        "developer statistics",
        "contribution graph",
        "GitHub visualization",
        "developer portfolio",
        "code commits",
        "repository stats",
      ],
      authors: [{ name: "Karan Dev", url: "https://karandev.in" }],
      creator: "Karan Dev",
      publisher: "GitAura",
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
      alternates: {
        canonical: canonicalUrl,
      },

      twitter: {
        card: "summary_large_image",
        site: "@your_twitter", // Replace with your Twitter handle
        creator: "@your_twitter", // Replace with your Twitter handle
        title: "GitAura - Shared Profile | Developer Stats & Contributions",
        description:
          "View this beautifully visualized GitHub profile with contribution graphs and statistics.",
        images: [
          {
            url: ogImage || `${baseUrl}/api/og?shared=true`,
            alt: "Git Aura  - Flex your GitHub Aura",
          },
        ],
      },
      other: {
        "application-name":
          "GitAura - Shared Profile | Developer Stats & Contributions",
        "mobile-web-app-capable": "yes",
        "apple-mobile-web-app-capable": "yes",
        "apple-mobile-web-app-status-bar-style": "default",
        "apple-mobile-web-app-title":
          "GitAura - Shared Profile | Developer Stats & Contributions",
      },
    };
  }

  // Enhanced default metadata
  const canonicalUrl = baseUrl;

  return {
    title: "GitAura - Shared Profile | Developer Stats & Contributions",
    description:
      "Create stunning visualizations of any GitHub profile. View contribution graphs, repository statistics, and developer insights. Perfect for showcasing your coding journey and developer portfolio.",
    keywords: [
      "GitHub profile visualizer",
      "developer statistics",
      "contribution graph",
      "GitHub analytics",
      "developer portfolio",
      "GitHub contributions",
      "code visualization",
      "programming statistics",
      "developer insights",
      "GitHub dashboard",
      "repository stats",
      "coding activity",
      "open source contributions",
    ],
    authors: [{ name: "Karan Dev", url: "https://karandev.in" }],
    creator: "Karan Dev",
    publisher: "GitAura",
    category: "Developer Tools",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      title: "GitAura - Shared Profile | Developer Stats & Contributions",
      description:
        "Create stunning visualizations of any GitHub profile. View contribution graphs, repository statistics, and developer insights.",
      url: canonicalUrl,
      siteName: "GitAura - Shared Profile | Developer Stats & Contributions",
      images: [
        {
          url: `${baseUrl}/api/og`,
          width: 1200,
          height: 630,
          alt: "Git Aura - Flex your GitHub Aura",
          type: "image/png",
        },
      ],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      site: "@your_twitter", // Replace with your Twitter handle
      creator: "@your_twitter", // Replace with your Twitter handle
      title: "Git Aura - Flex your GitHub Aura",
      description:
        "Create stunning visualizations of any GitHub profile with beautiful contribution graphs and statistics.",
      images: [
        {
          url: `${baseUrl}/api/og`,
          alt: "GitHub Profile Visualizer",
        },
      ],
    },
    other: {
      "application-name": "GitHub Profile Visualizer",
      "mobile-web-app-capable": "yes",
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "default",
      "apple-mobile-web-app-title": "GitHub Profile Visualizer",
      "theme-color": "#0d1117",
      "color-scheme": "dark light",
    },
  };
}

// JSON-LD Structured Data Component
function StructuredData() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://git-aura.karandev.in";

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "GitAura - Shared Profile | Developer Stats & Contributions",
    description:
      "Beautiful GitHub profile and contribution visualization tool for developers",
    url: baseUrl,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    creator: {
      "@type": "Person",
      name: "Karan Dev",
      url: "https://karandev.in",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "GitHub profile visualization",
      "Contribution graph display",
      "Repository statistics",
      "Profile sharing",
      "Multiple themes",
      "Export functionality",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
    />
  );
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <>
      {/* <StructuredData /> */}
      <Header leaderboard={true} dashboard={true} />

      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <TopAuraUsers />
      {/* <SocialProof /> */}
      <Footer />
    </>
  );
}
