"server-only";

import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import * as bilingualmanga from "./schema/bilingualmanga";
import * as ichiran from "./schema/ichiran";

dotenv.config();

console.log(
  `Creating db instance with DATABASE_URL=${process.env.DATABASE_URL}`,
);

export const db = drizzle(process.env.DATABASE_URL!, {
  logger: true,
  schema: { ...bilingualmanga, ...ichiran },
});
