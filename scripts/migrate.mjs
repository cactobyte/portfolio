// Applies pending migrations in ./drizzle. Runs before every build; a no-op when no database is configured,
// so the public portfolio keeps building without credentials.
const url = process.env.DATABASE_URL;

if (!url) {
  console.log("migrate: DATABASE_URL not set, skipping");
} else if (url.startsWith("pglite:")) {
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const client = new PGlite(url.slice("pglite:".length));
  await migrate(drizzle(client), { migrationsFolder: "drizzle" });
  await client.close();
  console.log("migrate: local database up to date");
} else {
  const { neon } = await import("@neondatabase/serverless");
  const { drizzle } = await import("drizzle-orm/neon-http");
  const { migrate } = await import("drizzle-orm/neon-http/migrator");
  await migrate(drizzle(neon(url)), { migrationsFolder: "drizzle" });
  console.log("migrate: database up to date");
}
