import Header from "@/components/Header";
import type { Metadata } from "next";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ username: string }>;
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
  params,
}: LayoutProps): Promise<Metadata> {
  const { username } = await params;

  // Base URL for canonical and OG URLs
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://git-aura.karandev.in";

  if (!username) {
    return {
      title: "GitHub Profile Visualizer | Beautiful Developer Statistics",
      description:
        "Create stunning visualizations of any GitHub profile with contribution graphs and statistics.",
    };
  }

  const userData = await fetchGitHubUserData(username);
  const canonicalUrl = `${baseUrl}/${encodeURIComponent(username)}`;

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
          url: `${baseUrl}/api/og?username=${encodeURIComponent(username)}`,
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
          url: `${baseUrl}/api/og?username=${encodeURIComponent(username)}`,
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

// JSON-LD Structured Data Component
function StructuredData({
  username,
  userData,
}: {
  username: string;
  userData?: any;
}) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://git-aura.karandev.in";

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

  const profileSchema = userData
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
          sameAs: [`https://github.com/${username}`, `${baseUrl}/${username}`],
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

export default async function UsernameLayout({
  children,
  params,
}: LayoutProps) {
  const { username } = await params;
  let userData = null;

  // Fetch user data for structured data if we have a username
  if (username) {
    userData = await fetchGitHubUserData(username);
  }

  return (
    <>
      <StructuredData username={username} userData={userData} />
      {children}

      {/* <Header
        selectedTheme={selectedTheme}
        setSelectedTheme={setSelectedTheme}
        currentView={currentView}
        setCurrentView={setCurrentView}
        userAura={userAura}
      /> */}
    </>
  );
}
