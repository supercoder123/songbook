import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

const globalForPostgres = globalThis as typeof globalThis & {
  songbookPostgresPool?: Pool;
};

const pool =
  globalForPostgres.songbookPostgresPool ??
  new Pool({
    connectionString:
      connectionString ?? "postgresql://songbook:password@127.0.0.1:5432/songbook",
    max: Number(process.env.POSTGRES_CONNECTION_LIMIT ?? 10),
    ssl:
      connectionString?.includes("sslmode=require") ||
      process.env.POSTGRES_SSL === "true"
        ? { rejectUnauthorized: false }
        : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPostgres.songbookPostgresPool = pool;
}

export function assertPostgresConfigured() {
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is required for Postgres-backed Songbook APIs."
    );
  }
}

export const postgresDb = drizzle(pool, { schema });
