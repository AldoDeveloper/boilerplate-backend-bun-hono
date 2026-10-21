import { SQL } from "bun";
import { env } from "./env";

// Bun.sql (native). Koneksi dibuat lazy saat query pertama dijalankan.
export const sql = new SQL(env.DATABASE_URL, {
  max: 20, // Maximum 20 concurrent connections
  idleTimeout: 30, // Close idle connections after 30s
  maxLifetime: 3600, // Max connection lifetime 1 hour
  connectionTimeout: 10, // Connection timeout 10s
});
