import type { Metadata } from "next";

interface UserLayoutProps {
  children: React.ReactNode;
  params: { id: string };
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const username = params.id;
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://git-aura.karandev.in";

  const title = `${username}'s GitHub Profile | GitHub Profile Visualizer`;
  const description = `Check out ${username}'s GitHub contributions, statistics, and coding activity. Beautiful visualizations of developer progress and project insights.`;

  // Default OG image - will be dynamically updated client-side if og_image param exists
  const ogImage = `${baseUrl}/api/og?username=${encodeURIComponent(username)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/user/${username}`,
      siteName: "GitHub Profile Visualizer",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${username}'s GitHub Profile Statistics`,
          type: "image/png",
        },
      ],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
    },
    other: {
      // Add canonical URL
      canonical: `/user/${username}`,
    },
  };
}

export default function UserLayout({ children, params }: UserLayoutProps) {
  return <>{children}</>;
}
