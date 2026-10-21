import type { ErrorHandler, NotFoundHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import { isProd } from "../config/env";
import { AppError } from "../core/errors";

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof ZodError) {
    return c.json(
      {
        success: false,
        message: "Validation error",
        errors: err.flatten().fieldErrors,
      },
      422,
    );
  }

  if (err instanceof AppError) {
    return c.json(
      { success: false, message: err.message, errors: err.errors },
      err.status,
    );
  }

  if (err instanceof HTTPException) return err.getResponse();

  if (err instanceof SyntaxError) {
    return c.json({ success: false, message: "Invalid JSON body" }, 400);
  }

  console.error(err);
  return c.json(
    {
      success: false,
      message: "Internal Server Error",
      ...(isProd ? {} : { error: err.message }),
    },
    500,
  );
};

export const notFoundHandler: NotFoundHandler = (c) =>
  c.json({ success: false, message: `Route ${c.req.method} ${c.req.path} not found` }, 404);
