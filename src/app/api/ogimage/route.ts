import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

// This route will serve a redirect to the og:image URL if present in the query string
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
const ogImage = searchParams.get("og_image") ?? undefined;
  if (ogImage) {
    // Option 1: Redirect to the image (for use as og:image)
    return NextResponse.redirect(ogImage, 302);
  }
  // Option 2: Return a fallback image or 404
  return new NextResponse("OG image not found", { status: 404 });
}
