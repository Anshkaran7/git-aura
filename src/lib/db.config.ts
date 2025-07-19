interface DatabaseConfig {
  url: string;
  directUrl: string;
}

function getDatabaseConfig(): DatabaseConfig {
  const url = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;

  if (!url) {
    throw new Error("DATABASE_URL is not defined");
  }

  // For Supabase, if DIRECT_URL is not provided, create it from DATABASE_URL
  const finalDirectUrl =
    directUrl || url.replace("?pgbouncer=true&connection_limit=1", "");

  return {
    url: url,
    directUrl: finalDirectUrl,
  };
}

export const dbConfig = getDatabaseConfig();
