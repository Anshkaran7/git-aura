import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { formatNumber } from "@/lib/utils2";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function GET(request: NextRequest) {
  try {
    // Get current month-year (YYYY-MM format)
    const now = new Date();
    const currentMonthYear = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;

    // Fetch top 5 monthly users
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
      .eq("month_year", currentMonthYear)
      .order("rank", { ascending: true })
      .limit(5);

    if (monthlyError) {
      console.error("Error fetching top monthly users:", monthlyError);
      // Return fallback data if current month has no data
      return NextResponse.json({
        topUsers: [],
        monthYear: currentMonthYear,
        fallback: true,
      });
    }

    // Transform data for the AnimatedTooltip component
    const transformedData =
      monthlyData?.map((entry: any, index: number) => ({
        id: index + 1, // Use numeric index for AnimatedTooltip component
        name:
          entry.users.display_name ||
          entry.users.github_username ||
          `User ${index + 1}`,
        designation: `Aura Score: ${formatNumber(entry.total_aura)}`,
        image:
          entry.users.avatar_url ||
          `https://api.dicebear.com/7.x/avatars/svg?seed=${
            entry.users.github_username || index
          }`,
        githubUsername: entry.users.github_username,
        rank: entry.rank,
        totalAura: entry.total_aura,
        contributions: entry.contributions_count,
        currentStreak: entry.users.current_streak || 0,
      })) || [];

    // Calculate total stats for the month
    const totalAuraPoints =
      monthlyData?.reduce(
        (sum: number, entry: any) => sum + entry.total_aura,
        0
      ) || 0;
    const totalContributions =
      monthlyData?.reduce(
        (sum: number, entry: any) => sum + entry.contributions_count,
        0
      ) || 0;

    // Get total number of participants this month
    const { count: totalParticipants } = await supabaseAdmin
      .from("monthly_leaderboards")
      .select("*", { count: "exact", head: true })
      .eq("month_year", currentMonthYear);

    return NextResponse.json({
      topUsers: transformedData,
      monthYear: currentMonthYear,
      stats: {
        totalAuraPoints,
        totalContributions,
        totalParticipants: totalParticipants || 0,
      },
    });
  } catch (error) {
    console.error("Error in top monthly users API:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        topUsers: [],
        fallback: true,
      },
      { status: 500 }
    );
  }
}
