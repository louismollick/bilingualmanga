import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config();

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
