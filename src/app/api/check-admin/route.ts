import { NextRequest, NextResponse } from "next/server";
import { isUserAdmin } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const { email, githubUsername } = await request.json();

    if (!email && !githubUsername) {
      return NextResponse.json(
        { error: "Email or GitHub username is required" },
        { status: 400 }
      );
    }

    const isAdmin = isUserAdmin(email, githubUsername);

    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
