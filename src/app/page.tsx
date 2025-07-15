import type { Metadata } from "next";
import { Suspense } from "react";
import GitHubProfileCard from "./components/GitHubProfileCard";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const username = params.username as string;
  const shareId = params.share as string;
  const ogImage = params.og_image as string;

  // If we have a shareId, fetch the profile data to get the username
  let profileUsername = username;
  if (shareId && !username) {
    try {
      // We'll need to make this call server-side or use a different approach
      // For now, we'll use a generic OG image for shared profiles
      return {
        title: "GitHub Profile Visualizer - Shared Profile",
        description: "View this GitHub profile visualization",
        openGraph: {
          title: "GitHub Profile Visualizer - Shared Profile",
          description: "View this GitHub profile visualization",
          images: [
            {
              url: ogImage || `/api/og?shared=true`,
              width: 1200,
              height: 630,
              alt: "GitHub Profile Visualization",
            },
          ],
        },
        twitter: {
          card: "summary_large_image",
          title: "GitHub Profile Visualizer - Shared Profile",
          description: "View this GitHub profile visualization",
          images: [ogImage || `/api/og?shared=true`],
        },
      };
    } catch (error) {
      console.error("Error fetching shared profile for metadata:", error);
    }
  }

  // If we have a username, create personalized metadata
  if (profileUsername) {
    return {
      title: `${profileUsername}'s GitHub Profile | GitHub Visualizer`,
      description: `View ${profileUsername}'s GitHub contributions and profile statistics`,
      openGraph: {
        title: `${profileUsername}'s GitHub Profile`,
        description: `View ${profileUsername}'s GitHub contributions and profile statistics`,
        images: [
          {
            url:
              ogImage ||
              `/api/og?username=${encodeURIComponent(profileUsername)}`,
            width: 1200,
            height: 630,
            alt: `${profileUsername}'s GitHub Profile`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${profileUsername}'s GitHub Profile`,
        description: `View ${profileUsername}'s GitHub contributions and profile statistics`,
        images: [
          ogImage || `/api/og?username=${encodeURIComponent(profileUsername)}`,
        ],
      },
    };
  }

  // Default metadata
  return {
    title: "GitHub Profile Visualizer",
    description: "Beautiful GitHub profile and contribution visualization",
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
}

export default function Page({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GitHubProfileCard />
    </Suspense>
  );
}
