import { RedisClient } from "bun";
import { env } from "./env";

// Bun native Redis client (butuh Bun >= 1.2.9). Koneksi lazy.
export const redis = new RedisClient(env.REDIS_URL);
