import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { monthYear, monthlyAura, contributionsCount, activeDays } = body;

    if (
      !monthYear ||
      monthlyAura === undefined ||
      contributionsCount === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required data" },
        { status: 400 }
      );
    }

    // Save monthly aura to monthly_leaderboards table
    const { error: monthlyError } = await supabaseAdmin
      .from("monthly_leaderboards")
      .upsert({
        user_id: userId,
        month_year: monthYear,
        total_aura: monthlyAura,
        contributions_count: contributionsCount,
        rank: 0, // Will be recalculated
      });

    if (monthlyError) {
      console.error("Error saving monthly aura:", monthlyError);
      return NextResponse.json(
        { error: "Failed to save monthly aura" },
        { status: 500 }
      );
    }

    // Get all monthly aura for this user to calculate total
    const { data: userMonthlyAura } = await supabaseAdmin
      .from("monthly_leaderboards")
      .select("total_aura")
      .eq("user_id", userId);

    // Calculate total aura from all months
    const totalAura =
      userMonthlyAura?.reduce((sum, month) => sum + month.total_aura, 0) || 0;

    // Update global leaderboard
    const { error: globalError } = await supabaseAdmin
      .from("global_leaderboard")
      .upsert({
        user_id: userId,
        total_aura: totalAura,
        rank: 0, // Will be recalculated
      });

    if (globalError) {
      console.error("Error updating global leaderboard:", globalError);
      return NextResponse.json(
        { error: "Failed to update global leaderboard" },
        { status: 500 }
      );
    }

    // Recalculate ranks for this month
    await recalculateMonthlyRanks(monthYear);

    // Recalculate global ranks
    await recalculateGlobalRanks();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in save-monthly-aura:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Recalculate monthly ranks
async function recalculateMonthlyRanks(monthYear: string) {
  const { data: leaderboard } = await supabaseAdmin
    .from("monthly_leaderboards")
    .select("user_id, total_aura")
    .eq("month_year", monthYear)
    .order("total_aura", { ascending: false });

  if (leaderboard) {
    const updates = leaderboard.map((entry, index) => ({
      user_id: entry.user_id,
      rank: index + 1,
    }));

    for (const update of updates) {
      await supabaseAdmin
        .from("monthly_leaderboards")
        .update({ rank: update.rank })
        .eq("user_id", update.user_id)
        .eq("month_year", monthYear);
    }
  }
}

// Recalculate global ranks
async function recalculateGlobalRanks() {
  const { data: globalLeaderboard } = await supabaseAdmin
    .from("global_leaderboard")
    .select("user_id, total_aura")
    .order("total_aura", { ascending: false });

  if (globalLeaderboard) {
    const updates = globalLeaderboard.map((entry, index) => ({
      user_id: entry.user_id,
      rank: index + 1,
    }));

    for (const update of updates) {
      await supabaseAdmin
        .from("global_leaderboard")
        .update({ rank: update.rank })
        .eq("user_id", update.user_id);
    }
  }
}
