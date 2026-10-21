import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import {
  MIGRATIONS_DIR,
  SEEDERS_DIR,
  DOWN_MARKER,
  UP_MARKER,
  slugify,
  timestamp,
} from "../utils";

function migrationTemplate(slug: string): string {
  const createMatch = slug.match(/^create_(.+)_table$/);
  if (createMatch) {
    const table = createMatch[1];
    return [
      UP_MARKER,
      `CREATE TABLE IF NOT EXISTS ${table} (`,
      "  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),",
      "  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),",
      "  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()",
      ");",
      "",
      DOWN_MARKER,
      `DROP TABLE IF EXISTS ${table};`,
      "",
    ].join("\n");
  }

  return [
    UP_MARKER,
    "-- tulis SQL untuk menerapkan perubahan di sini",
    "",
    DOWN_MARKER,
    "-- tulis SQL untuk membatalkan perubahan di sini",
    "",
  ].join("\n");
}

const seederTemplate = [
  'import type { SQL } from "bun";',
  "",
  "export async function seed(sql: SQL) {",
  "  // contoh:",
  "  // await sql`INSERT INTO table_name (col) VALUES (${'value'}) ON CONFLICT DO NOTHING`;",
  "}",
  "",
].join("\n");

export async function makeMigration(name?: string) {
  if (!name) throw new Error("Nama migration wajib diisi. Contoh: make:migration create_posts_table");
  const slug = slugify(name);
  const file = `${timestamp()}_${slug}.sql`;
  await mkdir(MIGRATIONS_DIR, { recursive: true });
  await Bun.write(join(MIGRATIONS_DIR, file), migrationTemplate(slug));
  console.log(`✔ Migration dibuat: database/migrations/${file}`);
}

export async function makeSeeder(name?: string) {
  if (!name) throw new Error("Nama seeder wajib diisi. Contoh: make:seeder post_seeder");
  const file = `${timestamp()}_${slugify(name)}.ts`;
  await mkdir(SEEDERS_DIR, { recursive: true });
  await Bun.write(join(SEEDERS_DIR, file), seederTemplate);
  console.log(`✔ Seeder dibuat: database/seeders/${file}`);
}
