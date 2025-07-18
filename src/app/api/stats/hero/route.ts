import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function GET(request: NextRequest) {
  try {
    // Get total number of users
    const { count: totalDevelopers } = await supabaseAdmin
      .from("users")
      .select("*", { count: "exact", head: true });

    // Get total aura points across all users
    const { data: totalAuraData, error: auraError } = await supabaseAdmin
      .from("users")
      .select("total_aura");

    if (auraError) {
      console.error("Error fetching total aura:", auraError);
    }

    const totalAuraPoints =
      totalAuraData?.reduce((sum, user) => sum + (user.total_aura || 0), 0) ||
      0;

    // Get total number of badges earned
    const { count: totalBadges } = await supabaseAdmin
      .from("user_badges")
      .select("*", { count: "exact", head: true });

    // Get current month stats for extra context
    const now = new Date();
    const currentMonthYear = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;

    const { count: monthlyActive } = await supabaseAdmin
      .from("monthly_leaderboards")
      .select("*", { count: "exact", head: true })
      .eq("month_year", currentMonthYear);

    // Get total contributions this month
    const { data: monthlyContributions, error: monthlyError } =
      await supabaseAdmin
        .from("monthly_leaderboards")
        .select("contributions_count")
        .eq("month_year", currentMonthYear);

    const totalMonthlyContributions =
      monthlyContributions?.reduce(
        (sum, entry) => sum + (entry.contributions_count || 0),
        0
      ) || 0;

    // Calculate growth metrics
    const averageAuraPerUser = totalDevelopers
      ? Math.round(totalAuraPoints / totalDevelopers)
      : 0;
    const averageBadgesPerUser = totalDevelopers
      ? Math.round((totalBadges || 0) / totalDevelopers)
      : 0;

    return NextResponse.json({
      totalDevelopers: totalDevelopers || 0,
      totalAuraPoints,
      totalBadges: totalBadges || 0,
      monthlyActive: monthlyActive || 0,
      totalMonthlyContributions,
      averageAuraPerUser,
      averageBadgesPerUser,
      monthYear: currentMonthYear,
    });
  } catch (error) {
    console.error("Error in hero stats API:", error);

    // Return fallback data on error
    return NextResponse.json({
      totalDevelopers: 0,
      totalAuraPoints: 0,
      totalBadges: 0,
      monthlyActive: 0,
      totalMonthlyContributions: 0,
      averageAuraPerUser: 0,
      averageBadgesPerUser: 0,
      fallback: true,
    });
  }
}
