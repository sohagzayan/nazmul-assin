import { config as loadEnv } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Load environment variables from common .env first, then override with .env.local if present.
loadEnv();
loadEnv({ path: ".env.local", override: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
