import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Public liveness/readiness probe. Deliberately reveals nothing beyond
// "is the app up and can it reach the database".
export async function GET() {
  const started = Date.now();
  let database: "ok" | "error" = "ok";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    database = "error";
  }
  const body = {
    status: database === "ok" ? "ok" : "degraded",
    database,
    latencyMs: Date.now() - started,
    timestamp: new Date().toISOString(),
  };
  return NextResponse.json(body, {
    status: database === "ok" ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
