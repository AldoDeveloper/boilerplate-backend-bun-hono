export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 3000),
  DATABASE_URL:
    process.env.DATABASE_URL ??
    "postgres://postgres:postgres@localhost:5432/hono_app",
  REDIS_URL: process.env.REDIS_URL ?? "redis://localhost:6379",
  JWT_SECRET: process.env.JWT_SECRET ?? "dev-secret-change-me",
  JWT_EXPIRES_IN: Number(process.env.JWT_EXPIRES_IN ?? 3600),
};

export const isProd = env.NODE_ENV === "production";
