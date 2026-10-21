import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";
import { env } from "../config/env";
import { ForbiddenError, UnauthorizedError } from "../core/errors";
import type { AppEnv, UserRole } from "../types";

export const authMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing or invalid Authorization header");
  }

  const token = header.slice(7);
  try {
    const payload = await verify(token, env.JWT_SECRET, "HS256");
    c.set("user", {
      id: payload.sub as string,
      email: payload.email as string,
      role: payload.role as UserRole,
    });
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }

  await next();
});

export const requireRole = (...roles: UserRole[]) =>
  createMiddleware<AppEnv>(async (c, next) => {
    const user = c.get("user");
    if (!user) {
      throw new ForbiddenError("You do not have access to this resource");
    }
    await next();
  });
