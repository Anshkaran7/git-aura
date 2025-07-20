import { Metadata } from "next";

export async function generateMetadata({ 
  params,
  searchParams 
}: { 
  params: { id: string };
  searchParams: any;
}): Promise<Metadata> {
  console.log('SIMPLE LAYOUT GENERATEMETADATA CALLED!');
  console.log('params:', params);
  console.log('searchParams:', searchParams);
  
  const userId = params.id;
  const ogImageParam = searchParams?.og_image;

  let ogImageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/og?username=${userId}`;

  if (ogImageParam) {
    ogImageUrl = decodeURIComponent(Array.isArray(ogImageParam) ? ogImageParam[0] : ogImageParam);
    console.log('Using custom OG image:', ogImageUrl);
  }
  
  console.log('Final OG URL:', ogImageUrl);
  
  return {
    title: `${userId}'s GitHub Profile | GitAura`,
    openGraph: {
      images: [{ url: ogImageUrl }],
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  console.log('User layout component rendering');
  return children;
}
