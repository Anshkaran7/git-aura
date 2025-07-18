import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const monthYear = searchParams.get("monthYear");
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "100");

    if (!monthYear) {
      return NextResponse.json(
        { error: "monthYear parameter is required" },
        { status: 400 }
      );
    }

    // Fetch monthly leaderboard data
    const { data: monthlyData, error: monthlyError } = await supabaseAdmin
      .from("monthly_leaderboards")
      .select(
        `
        rank,
        total_aura,
        contributions_count,
        users!inner(
          id,
          display_name,
          github_username,
          avatar_url,
          total_aura,
          current_streak
        )
      `
      )
      .eq("month_year", monthYear)
      .order("rank", { ascending: true })
      .limit(limit);

    if (monthlyError) {
      console.error("Error fetching monthly leaderboard:", monthlyError);
      return NextResponse.json(
        { error: "Failed to fetch monthly leaderboard" },
        { status: 500 }
      );
    }

    // Get user rank if userId is provided
    let userRank = null;
    if (userId) {
      const { data: userRankData, error: rankError } = await supabaseAdmin
        .from("monthly_leaderboards")
        .select("rank")
        .eq("month_year", monthYear)
        .eq("user_id", userId)
        .single();

      if (!rankError && userRankData) {
        userRank = userRankData.rank;
      }
    }

    // Fetch badges for users in the leaderboard
    let badges: any[] = [];
    if (monthlyData && monthlyData.length > 0) {
      const userIds = monthlyData.map((entry: any) => entry.users.id);
      const { data: badgesData, error: badgesError } = await supabaseAdmin
        .from("user_badges")
        .select(
          `
          user_id,
          month_year,
          rank,
          badges!inner(
            id,
            name,
            description,
            icon,
            color,
            rarity
          )
        `
        )
        .in("user_id", userIds);

      if (!badgesError && badgesData) {
        badges = badgesData;
      }
    }

    // Transform the data to match the frontend expectations
    const transformedData = monthlyData?.map((entry: any) => {
      const userBadges = badges.filter(
        (badge: any) => badge.user_id === entry.users.id
      );

      return {
        rank: entry.rank,
        user: entry.users,
        aura: entry.total_aura,
        contributions: entry.contributions_count,
        badges: userBadges.map((ub: any) => ({
          ...ub.badges,
          month_year: ub.month_year,
          rank: ub.rank,
        })),
      };
    }) || [];

    return NextResponse.json({
      leaderboard: transformedData,
      userRank,
      monthYear,
    });

  } catch (error) {
    console.error("Error in monthly leaderboard API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 