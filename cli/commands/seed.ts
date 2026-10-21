import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { sql } from "../../src/config/database";
import { SEEDERS_DIR } from "../utils";

/** Jalankan semua seeder (urut), atau filter dengan --class=<nama> */
export async function seed(only?: string) {
  const all = (await readdir(SEEDERS_DIR).catch(() => [] as string[]))
    .filter((f) => f.endsWith(".ts"))
    .sort();
  const files = only ? all.filter((f) => f.includes(only)) : all;

  if (files.length === 0) {
    console.log(only ? `Seeder "${only}" tidak ditemukan.` : "Tidak ada seeder.");
    return;
  }

  for (const file of files) {
    const mod = await import(join(SEEDERS_DIR, file));
    if (typeof mod.seed !== "function") {
      throw new Error(`Seeder "${file}" harus meng-export function seed(sql)`);
    }
    console.log(`⏳ Seeding: ${file}`);
    await mod.seed(sql);
    console.log(`✔ Seeded:  ${file}`);
  }
}
