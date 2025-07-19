import { PrismaClient } from "@prisma/client";
import { dbConfig } from "./db.config";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaClient = new PrismaClient({
  datasources: {
    db: {
      url: dbConfig.url,
    },
  },
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

async function testConnection() {
  try {
    await prismaClient.$connect();
    console.log("✅ Prisma connected to the database.");
  } catch (error) {
    console.error("❌ Failed to connect to the database with Prisma:", error);
  }
}

testConnection();

export const prisma = globalForPrisma.prisma ?? prismaClient;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
