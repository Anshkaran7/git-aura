import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ogImage = searchParams.get("og_image");
  const username = searchParams.get("username");

  if (ogImage) {
    // If there's a custom og_image parameter, redirect to that image
    const decodedImage = decodeURIComponent(ogImage);
    return NextResponse.redirect(decodedImage);
  }

  // Otherwise, redirect to the default OG image for the username
  const defaultOgUrl = new URL("/api/og", request.url);
  if (username) {
    defaultOgUrl.searchParams.set("username", username);
  }
  
  return NextResponse.redirect(defaultOgUrl);
}
