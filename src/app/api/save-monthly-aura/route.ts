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

    // Start a transaction for all database operations
    const { data: transaction, error: transactionError } = await supabaseAdmin.rpc(
      'update_user_aura_and_ranks',
      { 
        p_user_id: userId,
        p_month_year: monthYear,
        p_monthly_aura: monthlyAura,
        p_contributions_count: contributionsCount
      }
    );

    if (transactionError) {
      console.error("Error in transaction:", transactionError);
      return NextResponse.json(
        { error: "Failed to update leaderboards" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in save-monthly-aura:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
