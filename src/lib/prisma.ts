import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"], // optional
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Optimize for serverless
    transactionOptions: {
      maxWait: 5000, // default: 2000
      timeout: 10000, // default: 5000
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// DATABASE_URL=postgresql://postgres:gitAura2025@db.vxwwzvrzeptddawwvclj.supabase.co:5432/postgres
