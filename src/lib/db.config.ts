interface DatabaseConfig {
  url: string;
  directUrl: string;
}

function getDatabaseConfig(): DatabaseConfig {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL is not defined");
  }

  // For Neon PostgreSQL, use the same URL for both pooled and direct connections
  return {
    url: url,
    directUrl: url,
  };
}

export const dbConfig = getDatabaseConfig();
