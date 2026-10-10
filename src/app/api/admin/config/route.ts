import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// Which configuration is present on the main app. Booleans only — values are
// never returned.
const ENV_GROUPS: { group: string; keys: { key: string; required: boolean; note: string }[] }[] = [
  {
    group: "Database",
    keys: [
      { key: "DATABASE_URL", required: true, note: "Postgres connection (pooler)" },
      { key: "DIRECT_URL", required: false, note: "Direct connection for migrations" },
    ],
  },
  {
    group: "Authentication",
    keys: [
      { key: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", required: true, note: "Clerk publishable key" },
      { key: "CLERK_SECRET_KEY", required: true, note: "Clerk secret key" },
      { key: "CLERK_WEBHOOK_SECRET", required: false, note: "Clerk user-sync webhook" },
      { key: "ADMIN_EMAILS", required: false, note: "In-app admin emails" },
      { key: "ADMIN_GITHUB_USERNAMES", required: false, note: "In-app admin GitHub usernames" },
    ],
  },
  {
    group: "Automation",
    keys: [
      { key: "CRON_SECRET", required: true, note: "Vercel cron bearer token" },
      { key: "ADMIN_API_SECRET", required: true, note: "Shared secret for the admin panel" },
    ],
  },
  {
    group: "Integrations",
    keys: [
      { key: "GITHUB_TOKEN", required: true, note: "GitHub API (contributions)" },
      { key: "OPEN_AI_API_KEY", required: false, note: "AI profile messages" },
      { key: "NEXT_PUBLIC_IMGBB_API_KEY", required: false, note: "Share-image uploads" },
      { key: "NEXT_PUBLIC_BASE_URL", required: false, note: "Public site URL" },
    ],
  },
];

export async function GET(request: NextRequest) {
  const authResult = await authorizeAdmin(request);
  if (!authResult.ok) return authResult.response;

  const started = Date.now();
  let database: { ok: boolean; latencyMs: number; error?: string };
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = { ok: true, latencyMs: Date.now() - started };
  } catch (error) {
    database = {
      ok: false,
      latencyMs: Date.now() - started,
      error: error instanceof Error ? error.message.split("\n")[0].slice(0, 200) : "Unknown error",
    };
  }

  return NextResponse.json({
    checkedAt: new Date().toISOString(),
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "unknown",
    database,
    env: ENV_GROUPS.map(({ group, keys }) => ({
      group,
      keys: keys.map(({ key, required, note }) => ({
        key,
        required,
        note,
        configured: Boolean(process.env[key]?.trim()),
      })),
    })),
    cron: [
      { path: "/api/cron/daily-tasks", schedule: "0 0 * * *", description: "Refresh a user batch, then update ranks" },
      { path: "/api/cron/save-monthly-winners", schedule: "0 0 1 * *", description: "Capture the top 3 of the month (current month at run time)" },
    ],
  });
}
