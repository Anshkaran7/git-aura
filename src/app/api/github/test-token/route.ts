import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Check if GitHub token exists
    if (!process.env.GITHUB_TOKEN) {
      return NextResponse.json({
        status: "error",
        message: "GitHub token not found in environment variables",
        hasToken: false,
      });
    }

    // Test the token by making a simple authenticated request
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "User-Agent": "GitAura-App",
    };

    const response = await fetch("https://api.github.com/rate_limit", {
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        status: "error",
        message: "GitHub token is invalid",
        hasToken: true,
        error: data,
      });
    }

    return NextResponse.json({
      status: "success",
      message: "GitHub token is working correctly",
      hasToken: true,
      rateLimit: {
        core: data.resources.core,
        graphql: data.resources.graphql,
        search: data.resources.search,
      },
    });
  } catch (error) {
    console.error("Error testing GitHub token:", error);
    return NextResponse.json({
      status: "error",
      message: "Failed to test GitHub token",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
