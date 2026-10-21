import { sql } from "../src/config/database";
import { makeMigration, makeSeeder } from "./commands/make";
import { fresh, migrate, rollback, status } from "./commands/migrate";
import { seed } from "./commands/seed";

const [command, ...rest] = process.argv.slice(2);
const args = rest.filter((a) => !a.startsWith("--"));
const flags: Record<string, string | true> = Object.fromEntries(
  rest
    .filter((a) => a.startsWith("--"))
    .map((a) => {
      const [k, v] = a.slice(2).split("=");
      return [k, v ?? true];
    }),
);

const help = `
Usage: bun run cli <command> [options]

  make:migration <name>        Buat file migration baru (.sql)
  make:seeder <name>           Buat file seeder baru (.ts)
  migrate                      Jalankan semua migration yang pending
  migrate:rollback [--step=N]  Rollback batch terakhir (atau N migration terakhir)
  migrate:fresh [--seed]       Drop semua tabel, migrate ulang (opsional seed)
  migrate:status               Lihat status migration
  db:seed [--class=<nama>]     Jalankan seeder
`;

async function main() {
  switch (command) {
    case "make:migration":
      return makeMigration(args[0]);
    case "make:seeder":
      return makeSeeder(args[0]);
    case "migrate":
      return migrate();
    case "migrate:rollback":
      return rollback(typeof flags.step === "string" ? Number(flags.step) : undefined);
    case "migrate:fresh":
      await fresh();
      if (flags.seed) await seed();
      return;
    case "migrate:status":
      return status();
    case "db:seed":
      return seed(typeof flags.class === "string" ? flags.class : undefined);
    default:
      console.log(help);
  }
}

main()
  .catch((err) => {
    console.error(`✖ ${err instanceof Error ? err.message : err}`);
    process.exitCode = 1;
  })
  .finally(() => sql.close());
