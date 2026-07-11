import "dotenv/config";
import { defineConfig } from "prisma/config";

const databaseUrl = process.env["DIRECT_URL"] || process.env["DATABASE_URL"];

if (!databaseUrl) {
  throw new Error("DIRECT_URL or DATABASE_URL is missing in .env file");
}

export default defineConfig({
  schema: "prisma/schema",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});