import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { calculateTotalAura } from "../../../lib/aura";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// Same calculation logic as AuraPanel.tsx
const calculateMonthlyAura = (
  monthlyContributions: number,
  activeDays: number,
  daysInMonth: number
): number => {
  return Math.round(
    monthlyContributions * 10 + // 10 points per contribution
    activeDays * 50 + // 50 points per active day
    (activeDays / daysInMonth) * 1000 // Consistency bonus (up to 1000 points)
  );
};

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { monthYear, contributionsCount, activeDays, allContributions } = body;

    if (
      !monthYear ||
      contributionsCount === undefined ||
      activeDays === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required data" },
        { status: 400 }
      );
    }

    // Calculate days in month
    const [year, month] = monthYear.split("-").map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();

    // Calculate monthly aura using the same formula as frontend
    const monthlyAura = calculateMonthlyAura(contributionsCount, activeDays, daysInMonth);

    // Calculate total aura using the same function as frontend
    const totalAura = allContributions ? calculateTotalAura(allContributions) : 0;

    // Update or insert monthly leaderboard entry
    const { error: monthlyError } = await supabaseAdmin
      .from('monthly_leaderboards')
      .upsert({
        user_id: userId,
        month_year: monthYear,
        total_aura: monthlyAura,
        contributions_count: contributionsCount,
        rank: 0 // Will be updated later
      }, {
        onConflict: 'user_id,month_year'
      });

    if (monthlyError) {
      console.error("Error updating monthly leaderboard:", monthlyError);
      return NextResponse.json(
        { error: "Failed to update monthly leaderboard" },
        { status: 500 }
      );
    }

    // Update or insert global leaderboard entry with total aura from all contributions
    const { error: globalError } = await supabaseAdmin
      .from('global_leaderboard')
      .upsert({
        user_id: userId,
        total_aura: totalAura,
        rank: 0 // Will be updated later
      }, {
        onConflict: 'user_id'
      });

    if (globalError) {
      console.error("Error updating global leaderboard:", globalError);
      return NextResponse.json(
        { error: "Failed to update global leaderboard" },
        { status: 500 }
      );
    }

    // Update monthly ranks for the specific month
    const { data: monthlyUsers, error: getMonthlyError } = await supabaseAdmin
      .from('monthly_leaderboards')
      .select('user_id, total_aura')
      .eq('month_year', monthYear)
      .order('total_aura', { ascending: false });

    if (getMonthlyError) {
      console.error("Error getting monthly users:", getMonthlyError);
      // Don't fail the request for ranking errors, just log them
    } else {
      // Update ranks for monthly leaderboard
      for (let i = 0; i < monthlyUsers.length; i++) {
        const { error: updateMonthlyRankError } = await supabaseAdmin
          .from('monthly_leaderboards')
          .update({ rank: i + 1 })
          .eq('user_id', monthlyUsers[i].user_id)
          .eq('month_year', monthYear);

        if (updateMonthlyRankError) {
          console.error("Error updating monthly rank:", updateMonthlyRankError);
        }
      }
    }

    // Update global ranks
    const { data: globalUsers, error: getGlobalError } = await supabaseAdmin
      .from('global_leaderboard')
      .select('user_id, total_aura')
      .order('total_aura', { ascending: false });

    if (getGlobalError) {
      console.error("Error getting global users:", getGlobalError);
      // Don't fail the request for ranking errors, just log them
    } else {
      // Update ranks for global leaderboard
      for (let i = 0; i < globalUsers.length; i++) {
        const { error: updateGlobalRankError } = await supabaseAdmin
          .from('global_leaderboard')
          .update({ rank: i + 1 })
          .eq('user_id', globalUsers[i].user_id);

        if (updateGlobalRankError) {
          console.error("Error updating global rank:", updateGlobalRankError);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      monthlyAura,
      totalAura 
    });
  } catch (error) {
    console.error("Error in save-monthly-aura:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
