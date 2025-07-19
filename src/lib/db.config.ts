interface DatabaseConfig {
  url: string;
  directUrl: string;
}

function getDatabaseConfig(): DatabaseConfig {
  const url = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;

  if (!url) {
    throw new Error(
      "DATABASE_URL is not defined. Please check your environment variables."
    );
  }

  console.log(
    "Database URL configured:",
    url.includes("pgbouncer")
      ? "Using pooled connection"
      : "Using direct connection"
  );

  // For Supabase, ensure we're using the pooled connection for serverless
  // The pooled URL should include ?pgbouncer=true&connection_limit=1
  let finalUrl = url;
  let finalDirectUrl = directUrl;

  // If URL doesn't have pgbouncer, add it for serverless environments
  if (process.env.NODE_ENV === "production" && !url.includes("pgbouncer")) {
    const separator = url.includes("?") ? "&" : "?";
    finalUrl = `${url}${separator}pgbouncer=true&connection_limit=1`;
    console.log("Added pgbouncer to DATABASE_URL for production");
  }

  // For Supabase, if DIRECT_URL is not provided, create it from DATABASE_URL
  if (!finalDirectUrl) {
    finalDirectUrl = url.replace(/\?.*pgbouncer.*/, "").split("?")[0];
    console.log("Generated DIRECT_URL from DATABASE_URL");
  }

  return {
    url: finalUrl,
    directUrl: finalDirectUrl,
  };
}

export const dbConfig = getDatabaseConfig();
