#!/usr/bin/env node

const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config({ path: ".env", quiet: true });

const restoreOrder = [
  "user",
  "badge",
  "auraCalculation",
  "userBadge",
  "monthlyLeaderboard",
  "monthlyWinners",
  "globalLeaderboard",
];

const deleteOrder = [...restoreOrder].reverse();

function readArg(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

async function createMany(prisma, modelName, rows) {
  if (!rows || rows.length === 0) {
    console.log(`${modelName}: 0`);
    return;
  }

  await prisma[modelName].createMany({
    data: rows,
    skipDuplicates: true,
  });
  console.log(`${modelName}: ${rows.length}`);
}

async function main() {
  const filePath = readArg("--file");
  const databaseUrl =
    readArg("--url") || process.env.DEST_DATABASE_URL || process.env.DATABASE_URL;
  const shouldWipe = process.argv.includes("--wipe");

  if (!filePath) {
    throw new Error("Missing backup file. Pass --file backups/your-backup.json.");
  }

  if (!databaseUrl) {
    throw new Error(
      "Missing destination database URL. Set DEST_DATABASE_URL/DATABASE_URL or pass --url."
    );
  }

  const backup = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const prisma = new PrismaClient({
    datasources: { db: { url: databaseUrl } },
  });

  try {
    if (shouldWipe) {
      for (const modelName of deleteOrder) {
        await prisma[modelName].deleteMany();
      }
      console.log("Destination tables wiped.");
    }

    for (const modelName of restoreOrder) {
      await createMany(prisma, modelName, backup.tables[modelName]);
    }

    console.log("Restore complete.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
