import { Metadata } from 'next'

type Props = {
  params: { id: string }
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = params
  
  // Base URL for your application
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  // Generate OG image URL
  const ogImageUrl = `${baseUrl}/api/og?username=${encodeURIComponent(id)}`
  
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
  }
}

export default function Layout({ children }: Props) {
  return children
}
