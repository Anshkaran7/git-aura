#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config({ path: ".env", quiet: true });

const models = [
  ["user", "users"],
  ["badge", "badges"],
  ["auraCalculation", "aura_calculations"],
  ["userBadge", "badge"],
  ["monthlyLeaderboard", "monthly_leaderboards"],
  ["monthlyWinners", "monthly_winners"],
  ["globalLeaderboard", "global_leaderboard"],
];

function resolveDatabaseUrl() {
  const flagIndex = process.argv.indexOf("--url");
  if (flagIndex !== -1 && process.argv[flagIndex + 1]) {
    return process.argv[flagIndex + 1];
  }

  return process.env.SOURCE_DATABASE_URL || process.env.DATABASE_URL;
}

async function main() {
  const databaseUrl = resolveDatabaseUrl();

  if (!databaseUrl) {
    throw new Error(
      "Missing database URL. Set SOURCE_DATABASE_URL/DATABASE_URL or pass --url."
    );
  }

  const prisma = new PrismaClient({
    datasources: { db: { url: databaseUrl } },
  });

  const backup = {
    createdAt: new Date().toISOString(),
    app: "git-aura",
    schema: "prisma/schema.prisma",
    tables: {},
  };

  try {
    for (const [clientName, tableName] of models) {
      backup.tables[clientName] = await prisma[clientName].findMany();
      console.log(`${tableName}: ${backup.tables[clientName].length}`);
    }

    const backupDir = path.join(process.cwd(), "backups");
    fs.mkdirSync(backupDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filePath = path.join(backupDir, `git-aura-db-backup-${timestamp}.json`);
    fs.writeFileSync(filePath, JSON.stringify(backup, null, 2));

    console.log(`Backup saved: ${filePath}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
