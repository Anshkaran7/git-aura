import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Keep the database explicit so local/dev/prod never accidentally use a stale fallback.
const url = process.env.DATABASE_URL;
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
