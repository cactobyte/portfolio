import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function connect() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. Add the Neon integration in Vercel, or see README for local dev.");

  if (url.startsWith("pglite:")) {
    // Local development only: an embedded Postgres in a folder, so no database server is needed.
    // The query builder API is identical, so it is typed as the production driver.
    /* eslint-disable @typescript-eslint/no-require-imports */
    const { PGlite } = require("@electric-sql/pglite") as typeof import("@electric-sql/pglite");
    const { drizzle: drizzlePglite } = require("drizzle-orm/pglite") as typeof import("drizzle-orm/pglite");
    /* eslint-enable @typescript-eslint/no-require-imports */
    return drizzlePglite(new PGlite(url.slice("pglite:".length)), { schema }) as unknown as ReturnType<
      typeof connectNeon
    >;
  }
  return connectNeon(url);
}

function connectNeon(url: string) {
  return drizzle(neon(url), { schema });
}

let instance: ReturnType<typeof connectNeon> | undefined;

/** Connects lazily so builds and public pages never need database credentials. */
export function db() {
  instance ??= connect();
  return instance;
}

export { schema };
