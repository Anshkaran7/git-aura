import type { Metadata } from "next";
// Re-export metadata generation from dedicated file to keep this component lean
export { generateMetadata } from "./page-metadata";
import {
  HeroSection,
  FeaturesSection,
  HowItWorks,
  SocialProof,
  Footer,
} from "@/components/home";
import { Header } from "@/components/home/header";
import TopAuraUsers from "@/components/animated-tooltip-demo";
import { ProductHuntBanner } from "@/components/ProductHuntBanner";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}


// JSON-LD Structured Data Component
function StructuredData() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://git-aura.karandev.in";

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "GitAura - Flex your GitHub Aura",
    description:
      "Flex your GitHub Aura with beautiful contribution graphs and statistics.",
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
      {/* Structured data kept optional for now */}
      {/* <StructuredData /> */}
      {/* <ProductHuntBanner /> */}
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
