import type { Metadata } from "next";
import { Mona_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeAwareProviders } from "@/components/theme-aware-providers"; // Import the ThemeAwareProviders to wrap the app
import { Analytics } from "@vercel/analytics/react";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import UserSync from "@/components/UserSync";
import { Toaster } from "sonner";
import { ProductHuntBanner } from "@/components/ProductHuntBanner";
import ScrollToTop from "@/components/ScrollToTop";

const monaSans = Mona_Sans({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
  weight: ["200", "300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://git-aura.karandev.in/"
  ),
  title: {
    default: "GitAura | Beautiful Developer Statistics & Contribution Graphs",
    template: "%s | GitAura",
  },
  description:
    "Create stunning visualizations of any GitHub profile. View contribution graphs, repository statistics, and developer insights. Perfect for showcasing your coding journey and developer portfolio.",
  applicationName: "GitAura",
  authors: [{ name: "Karan Dev", url: "https://karandev.in" }],
  creator: "Karan Dev",
  publisher: "GitAura",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  keywords: [
    "GitHub",
    "Profile",
    "Contributions",
    "Visualization",
    "Developer Stats",
    "Contribution Graph",
    "Repository Statistics",
    "Developer Portfolio",
    "Code Analytics",
    "Programming Activity",
    "Open Source",
    "GitHub Dashboard",
    "Developer Tools",
    "GitHub API",
    "React Application",
    "GitAura",
    "Github Aura",
  ],
  category: "Developer Tools",
  classification: "Web Application",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // OpenGraph metadata removed - will be handled by nested layouts
  twitter: {
    card: "summary_large_image",
    site: "@itsmeekaran", // Replace with your actual Twitter handle
    creator: "@itsmeekaran", // Replace with your actual Twitter handle
    title: "GitAura | Developer Statistics",
    description:
      "Create stunning visualizations of any GitHub profile with beautiful contribution graphs and statistics.",
    images: ["/api/og"],
  },
  verification: {
    // Add your verification tokens here when you have them
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
    // other: {
    //   'msvalidate.01': 'your-bing-verification-code',
    // },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#0d1117",
      },
    ],
  },
  manifest: "/manifest.json",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "GitAura",
    "application-name": "GitAura",
    "msapplication-TileColor": "#0a0a0a",
    "msapplication-config": "/browserconfig.xml",
    "theme-color": "#0a0a0a",
    "color-scheme": "dark light",
  },
};

// Enhanced structured data for the organization
function OrganizationStructuredData() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://git-aura.karandev.in/";

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GitAura",
    url: baseUrl,
    logo: `${baseUrl}/api/og`,
    description:
      "Beautiful GitHub profile and contribution visualization tool for developers",
    founder: {
      "@type": "Person",
      name: "Karan Dev",
      url: "https://karandev.in",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Creator",
      url: "https://karandev.in",
    },
    sameAs: [
      "https://github.com/karandev/git-aura", // Update with your actual repo
      "https://karandev.in",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`scroll-smooth ${monaSans.className}`}
    >
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://api.github.com" />
        <link rel="preconnect" href="https://avatars.githubusercontent.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* DNS prefetch for faster lookups */}
        <link rel="dns-prefetch" href="//api.github.com" />
        <link rel="dns-prefetch" href="//avatars.githubusercontent.com" />

        {/* Performance hints */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

        {/* Security headers */}
        <meta
          httpEquiv="Content-Security-Policy"
          content="upgrade-insecure-requests"
        />
        <meta name="referrer" content="origin-when-cross-origin" />

        {/* Additional SEO meta tags */}
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />

        {/* Rich snippets support */}
        <meta itemProp="name" content="GitAura" />
        <meta
          itemProp="description"
          content="Create stunning visualizations of any GitHub profile with beautiful contribution graphs and statistics."
        />
        <meta itemProp="image" content="/api/og" />

        <OrganizationStructuredData />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeAwareProviders>
            {children}
            <ScrollToTop />
          </ThemeAwareProviders>

          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
