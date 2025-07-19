interface DatabaseConfig {
  url: string;
}

function getDatabaseConfig(): DatabaseConfig {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL is not defined");
  }

  return {
    url: url,
  };
}

export const dbConfig = getDatabaseConfig();
