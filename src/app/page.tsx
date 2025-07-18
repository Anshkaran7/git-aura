import type { Metadata } from "next";
import { Suspense } from "react";
import GitHubProfileCard from "./components/GitHubProfileCard";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Enhanced SEO utility function to fetch GitHub user data for better metadata
async function fetchGitHubUserData(username: string) {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        "User-Agent": "GitHub-Profile-Visualizer",
      },
      // Cache for 1 hour
      next: { revalidate: 3600 },
    });

    if (!response.ok) return null;

    const userData = await response.json();
    return {
      name: userData.name || username,
      bio: userData.bio || "",
      followers: userData.followers || 0,
      public_repos: userData.public_repos || 0,
      created_at: userData.created_at,
      avatar_url: userData.avatar_url,
    };
  } catch (error) {
    console.error("Error fetching GitHub user data:", error);
    return null;
  }
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const username = params.username as string;
  const shareId = params.share as string;
  const ogImage = params.og_image as string;

  // Base URL for canonical and OG URLs
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://git-aura.karandev.in";

  // Enhanced shared profile metadata
  if (shareId && !username) {
    const canonicalUrl = `${baseUrl}?share=${shareId}`;

    return {
      title:
        "GitHub Profile Visualizer - Shared Profile | Developer Stats & Contributions",
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
      publisher: "GitHub Profile Visualizer",
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
        type: "profile",
        title: "GitHub Profile Visualizer - Shared Developer Profile",
        description:
          "View this beautifully visualized GitHub profile with contribution graphs, repository statistics, and developer insights.",
        url: canonicalUrl,
        siteName: "GitHub Profile Visualizer",
        images: [
          {
            url: ogImage || `${baseUrl}/api/og?shared=true`,
            width: 1200,
            height: 630,
            alt: "GitHub Profile Visualization - Shared Profile",
            type: "image/png",
          },
        ],
        locale: "en_US",
      },
      twitter: {
        card: "summary_large_image",
        site: "@your_twitter", // Replace with your Twitter handle
        creator: "@your_twitter", // Replace with your Twitter handle
        title: "GitHub Profile Visualizer - Shared Developer Profile",
        description:
          "View this beautifully visualized GitHub profile with contribution graphs and statistics.",
        images: [
          {
            url: ogImage || `${baseUrl}/api/og?shared=true`,
            alt: "GitHub Profile Visualization - Shared Profile",
          },
        ],
      },
      other: {
        "application-name": "GitHub Profile Visualizer",
        "mobile-web-app-capable": "yes",
        "apple-mobile-web-app-capable": "yes",
        "apple-mobile-web-app-status-bar-style": "default",
        "apple-mobile-web-app-title": "GitHub Profile Visualizer",
      },
    };
  }

  // Enhanced username-based metadata with GitHub API data
  if (username) {
    const userData = await fetchGitHubUserData(username);
    const canonicalUrl = `${baseUrl}?username=${encodeURIComponent(username)}`;

    const displayName = userData?.name || username;
    const userBio = userData?.bio ? ` - ${userData.bio}` : "";
    const followerCount = userData?.followers
      ? ` | ${userData.followers} followers`
      : "";
    const repoCount = userData?.public_repos
      ? ` | ${userData.public_repos} repositories`
      : "";

    const title = `${displayName}'s GitHub Profile${followerCount}${repoCount} | GitHub Visualizer`;
    const description = `Explore ${displayName}'s GitHub journey with beautiful visualizations${userBio}. View contribution graphs, repository statistics, and developer insights.`;

    return {
      title,
      description,
      keywords: [
        `${username} GitHub`,
        `${displayName} developer profile`,
        "GitHub contributions",
        "developer statistics",
        "contribution graph",
        "GitHub visualization",
        "developer portfolio",
        "code commits",
        "repository stats",
        "open source contributions",
        "programming activity",
      ],
      authors: [
        { name: displayName, url: `https://github.com/${username}` },
        { name: "Karan Dev", url: "https://karandev.in" },
      ],
      creator: "Karan Dev",
      publisher: "GitHub Profile Visualizer",
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
        type: "profile",
        title: `${displayName}'s GitHub Profile | Developer Statistics & Contributions`,
        description,
        url: canonicalUrl,
        siteName: "GitHub Profile Visualizer",
        images: [
          {
            url:
              ogImage ||
              `${baseUrl}/api/og?username=${encodeURIComponent(username)}`,
            width: 1200,
            height: 630,
            alt: `${displayName}'s GitHub Profile Visualization`,
            type: "image/png",
          },
        ],
        locale: "en_US",
        ...(userData && {
          profile: {
            firstName: userData.name?.split(" ")[0] || username,
            lastName: userData.name?.split(" ").slice(1).join(" ") || "",
            username: username,
          },
        }),
      },
      twitter: {
        card: "summary_large_image",
        site: "@your_twitter", // Replace with your Twitter handle
        creator: "@your_twitter", // Replace with your Twitter handle
        title: `${displayName}'s GitHub Profile | Developer Stats`,
        description: `Explore ${displayName}'s GitHub contributions and developer statistics with beautiful visualizations.`,
        images: [
          {
            url:
              ogImage ||
              `${baseUrl}/api/og?username=${encodeURIComponent(username)}`,
            alt: `${displayName}'s GitHub Profile Visualization`,
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
      },
    };
  }

  // Enhanced default metadata
  const canonicalUrl = baseUrl;

  return {
    title:
      "GitHub Profile Visualizer | Beautiful Developer Statistics & Contribution Graphs",
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
    publisher: "GitHub Profile Visualizer",
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
      title: "GitHub Profile Visualizer | Beautiful Developer Statistics",
      description:
        "Create stunning visualizations of any GitHub profile. View contribution graphs, repository statistics, and developer insights.",
      url: canonicalUrl,
      siteName: "GitHub Profile Visualizer",
      images: [
        {
          url: `${baseUrl}/api/og`,
          width: 1200,
          height: 630,
          alt: "GitHub Profile Visualizer - Beautiful Developer Statistics",
          type: "image/png",
        },
      ],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      site: "@your_twitter", // Replace with your Twitter handle
      creator: "@your_twitter", // Replace with your Twitter handle
      title: "GitHub Profile Visualizer | Developer Statistics",
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
function StructuredData({
  username,
  userData,
}: {
  username?: string;
  userData?: any;
}) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://github-profile-visualizer.vercel.app";

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "GitHub Profile Visualizer",
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

  const profileSchema =
    username && userData
      ? {
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          mainEntity: {
            "@type": "Person",
            name: userData.name || username,
            alternateName: username,
            description:
              userData.bio || `GitHub developer profile for ${username}`,
            url: `https://github.com/${username}`,
            image: userData.avatar_url,
            sameAs: [
              `https://github.com/${username}`,
              `${baseUrl}?username=${username}`,
            ],
            knowsAbout: "Software Development",
            hasOccupation: {
              "@type": "Occupation",
              name: "Software Developer",
            },
          },
          about: {
            "@type": "WebApplication",
            name: "GitHub Profile Visualizer",
          },
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      {profileSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(profileSchema) }}
        />
      )}
    </>
  );
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const username = params.username as string;
  let userData = null;

  // Fetch user data for structured data if we have a username
  if (username) {
    userData = await fetchGitHubUserData(username);
  }

  return (
    <>
      <StructuredData username={username} userData={userData} />
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen bg-gray-100 ">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Loading GitHub profile...
              </p>
            </div>
          </div>
        }
      >
        <GitHubProfileCard />
      </Suspense>
    </>
  );
}
