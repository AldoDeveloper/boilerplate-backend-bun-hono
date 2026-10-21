import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { sql } from "../../src/config/database";
import { isProd } from "../../src/config/env";
import { MIGRATIONS_DIR, parseMigration } from "../utils";

async function ensureMigrationsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS migrations (
      id          SERIAL PRIMARY KEY,
      name        VARCHAR(255) NOT NULL UNIQUE,
      batch       INTEGER NOT NULL,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

async function listFiles(): Promise<string[]> {
  const files = await readdir(MIGRATIONS_DIR).catch(() => [] as string[]);
  return files.filter((f) => f.endsWith(".sql")).sort();
}

async function readMigration(file: string) {
  const content = await Bun.file(join(MIGRATIONS_DIR, file)).text();
  return parseMigration(content, file);
}

export async function migrate() {
  await ensureMigrationsTable();

  const files = await listFiles();
  const rows = (await sql`SELECT name FROM migrations`) as { name: string }[];
  const ran = new Set(rows.map((r) => r.name));
  const pending = files.filter((f) => !ran.has(f));

  if (pending.length === 0) {
    console.log("Nothing to migrate.");
    return;
  }

  const [{ batch }] = await sql`SELECT (COALESCE(MAX(batch), 0) + 1)::int AS batch FROM migrations`;

  for (const file of pending) {
    const { up } = await readMigration(file);
    console.log(`⏳ Migrating: ${file}`);
    await sql.begin(async (tx) => {
      await tx.unsafe(up);
      await tx`INSERT INTO migrations (name, batch) VALUES (${file}, ${batch})`;
    });
    console.log(`✔ Migrated:  ${file}`);
  }
}

export async function rollback(step?: number) {
  await ensureMigrationsTable();

  const rows = (
    step
      ? await sql`SELECT name FROM migrations ORDER BY id DESC LIMIT ${step}`
      : await sql`
          SELECT name FROM migrations
          WHERE batch = (SELECT MAX(batch) FROM migrations)
          ORDER BY id DESC
        `
  ) as { name: string }[];

  if (rows.length === 0) {
    console.log("Nothing to rollback.");
    return;
  }

  for (const { name } of rows) {
    const { down } = await readMigration(name);
    console.log(`⏳ Rolling back: ${name}`);
    await sql.begin(async (tx) => {
      await tx.unsafe(down);
      await tx`DELETE FROM migrations WHERE name = ${name}`;
    });
    console.log(`✔ Rolled back:  ${name}`);
  }
}

export async function fresh() {
  if (isProd) throw new Error("migrate:fresh tidak diizinkan di production.");
  console.log("⚠ Dropping all tables...");
  await sql.unsafe("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
  await migrate();
}

export async function status() {
  await ensureMigrationsTable();
  const files = await listFiles();
  const rows = (await sql`SELECT name, batch FROM migrations`) as {
    name: string;
    batch: number;
  }[];
  const ran = new Map(rows.map((r) => [r.name, r.batch]));

  console.table(
    files.map((f) => ({
      migration: f,
      status: ran.has(f) ? "Ran" : "Pending",
      batch: ran.get(f) ?? "-",
    })),
  );
}
