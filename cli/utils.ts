import { join } from "node:path";

export const ROOT = join(import.meta.dir, "..");
export const MIGRATIONS_DIR = join(ROOT, "database", "migrations");
export const SEEDERS_DIR = join(ROOT, "database", "seeders");

export const UP_MARKER = "-- +migrate Up";
export const DOWN_MARKER = "-- +migrate Down";

/** YYYYMMDDHHMMSS (UTC) */
export function timestamp(date = new Date()): string {
  return date.toISOString().replace(/[-:T]/g, "").slice(0, 14);
}

export function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function parseMigration(content: string, file: string) {
  const upIdx = content.indexOf(UP_MARKER);
  const downIdx = content.indexOf(DOWN_MARKER);
  if (upIdx === -1 || downIdx === -1 || downIdx < upIdx) {
    throw new Error(
      `Migration "${file}" harus memiliki "${UP_MARKER}" lalu "${DOWN_MARKER}"`,
    );
  }
  return {
    up: content.slice(upIdx + UP_MARKER.length, downIdx).trim(),
    down: content.slice(downIdx + DOWN_MARKER.length).trim(),
  };
}
