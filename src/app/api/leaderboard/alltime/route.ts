import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Ensure we don't go beyond top 100 users
    const maxLimit = Math.min(100, offset + limit);

    // Get total count of users in leaderboard (up to 100)
    const { count: totalCount, error: countError } = await supabaseAdmin
      .from("global_leaderboard")
      .select("*", { count: "exact", head: true })
      .lte("rank", 100);

    if (countError) {
      console.error("Error getting total count:", countError);
    }

    // Fetch all-time leaderboard data with pagination
    const { data: alltimeData, error: alltimeError } = await supabaseAdmin
      .from("global_leaderboard")
      .select(
        `
        rank,
        total_aura,
        users!inner(
          id,
          display_name,
          github_username,
          avatar_url,
          current_streak
        )
      `
      )
      .lte("rank", 100) // Only show top 100 users
      .order("rank", { ascending: true })
      .range(offset, maxLimit - 1);

    if (alltimeError) {
      console.error("Error fetching all-time leaderboard:", alltimeError);
      return NextResponse.json(
        { error: "Failed to fetch all-time leaderboard" },
        { status: 500 }
      );
    }

    // Get user rank if userId is provided
    let userRank = null;
    if (userId) {
      const { data: userRankData, error: rankError } = await supabaseAdmin
        .from("global_leaderboard")
        .select("rank")
        .eq("user_id", userId)
        .single();

      if (!rankError && userRankData) {
        userRank = userRankData.rank;
      }
    }

    // Fetch badges for users in the leaderboard
    let badges: any[] = [];
    if (alltimeData && alltimeData.length > 0) {
      const userIds = alltimeData.map((entry: any) => entry.users.id);
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
    const transformedData =
      alltimeData?.map((entry: any) => {
        const userBadges = badges.filter(
          (badge: any) => badge.user_id === entry.users.id
        );

        return {
          rank: entry.rank,
          user: entry.users,
          aura: entry.total_aura,
          badges: userBadges.map((ub: any) => ({
            ...ub.badges,
            month_year: ub.month_year,
            rank: ub.rank,
          })),
        };
      }) || [];

    // Calculate pagination info
    const totalPages = Math.ceil((totalCount || 0) / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      leaderboard: transformedData,
      userRank,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount: totalCount || 0,
        hasNextPage,
        hasPrevPage,
        limit,
      },
    });
  } catch (error) {
    console.error("Error in all-time leaderboard API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
