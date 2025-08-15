import { Metadata } from "next";

interface Props {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const username = params.id;
  const ogImage = searchParams.og_image as string;

  // Base metadata
  const baseMetadata: Metadata = {
    title: `${username} - GitHub Profile | GitAura`,
    description: `View ${username}'s GitHub contributions, aura score, and statistics on GitAura. Track coding activity and compare with other developers.`,
    keywords: [
      "GitHub",
      "contributions",
      "developer",
      "coding",
      "profile",
      "statistics",
      "aura",
    ],
    authors: [{ name: "GitAura" }],
    creator: "GitAura",
    publisher: "GitAura",
    robots: "index, follow",
    openGraph: {
      type: "profile",
      siteName: "GitAura",
      title: `${username} - GitHub Profile`,
      description: `View ${username}'s GitHub contributions, aura score, and statistics on GitAura.`,
      url: `${
        process.env.NEXT_PUBLIC_APP_URL || "https://gitaura.vercel.app"
      }/user/${username}`,
      images: [
        {
          url:
            ogImage ||
            `${
              process.env.NEXT_PUBLIC_APP_URL || "https://gitaura.vercel.app"
            }/api/og?username=${username}`,
          width: 1200,
          height: 630,
          alt: `${username}'s GitHub Profile on GitAura`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${username} - GitHub Profile | GitAura`,
      description: `View ${username}'s GitHub contributions, aura score, and statistics on GitAura.`,
      images: [
        ogImage ||
          `${
            process.env.NEXT_PUBLIC_APP_URL || "https://gitaura.vercel.app"
          }/api/og?username=${username}`,
      ],
    },
  };

  // If we have a custom OG image, prioritize it
  if (ogImage) {
    baseMetadata.openGraph!.images = [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: `${username}'s GitHub Profile on GitAura`,
      },
    ];
    baseMetadata.twitter!.images = [ogImage];
  }

  return baseMetadata;
}
