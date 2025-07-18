import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Extract username from the URL path
  const username = request.nextUrl.pathname.split("/").pop(); // e.g., "/api/github/contributions/johndoe" => "johndoe"

  if (!username) {
    return NextResponse.json(
      { error: "Username is required" },
      { status: 400 }
    );
  }

  // Check if GitHub token is available
  if (!process.env.GITHUB_TOKEN) {
    console.warn("GitHub token not found in environment variables");
    return NextResponse.json(
      {
        error:
          "GitHub token not configured. Please set GITHUB_TOKEN environment variable.",
      },
      { status: 500 }
    );
  }

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    "User-Agent": "GitAura-App",
  };

  try {
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("GitHub API Error:", errorData);

      // Handle rate limiting specifically
      if (
        response.status === 403 &&
        errorData.message?.includes("rate limit")
      ) {
        return NextResponse.json(
          { error: "GitHub API rate limit exceeded. Please try again later." },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: errorData.message || "User not found" },
        { status: response.status }
      );
    }

    const profileData = await response.json();
    return NextResponse.json(profileData);
  } catch (error) {
    console.error("Error fetching GitHub user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}
