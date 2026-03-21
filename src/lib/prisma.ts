import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Allow a temporary sqlite fallback if developer hasn't set Postgres yet.
// If schema is Postgres but url starts with file:, Prisma will throw; we intercept to provide clearer guidance.
const url = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_fTPdqJ2h8glB@ep-polished-bar-adezczbv-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
if (!url) {
  console.warn("DATABASE_URL missing. Set a Postgres connection string before deploying.");
}
if (url && url.startsWith("file:")) {
  console.warn(
    "SQLite URL detected while schema expects PostgreSQL. Local dev will be limited. Set a Postgres DATABASE_URL for full functionality."
  );
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
    datasources: { db: { url } },
    transactionOptions: { maxWait: 5000, timeout: 10000 },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
