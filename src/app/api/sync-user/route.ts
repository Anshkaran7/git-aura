import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://vxwwzvrzeptddawwvclj.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4d3d6dnJ6ZXB0ZGRhd3d2Y2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NzM4NDQsImV4cCI6MjA2ODE0OTg0NH0.95XoVV1ZByBeO7vMEJCUZSpsnP37ZOZFoe094CAVXWo"
);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { githubUsername, githubData, contributionDays } = body;

    if (!githubUsername || !githubData || !contributionDays) {
      return NextResponse.json(
        { error: "Missing required data" },
        { status: 400 }
      );
    }

    // Save or update user in our database
    const { error: userError } = await supabaseAdmin.from("users").upsert({
      id: userId,
      email: githubData.email || `${githubUsername}@github.local`,
      github_username: githubUsername,
      github_id: githubData.id.toString(),
      display_name: githubData.name || githubUsername,
      avatar_url: githubData.avatar_url,
      github_data: githubData,
      updated_at: new Date().toISOString(),
    });

    if (userError) {
      console.error("Error saving user:", userError);
      return NextResponse.json(
        { error: "Failed to save user" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in sync-user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
