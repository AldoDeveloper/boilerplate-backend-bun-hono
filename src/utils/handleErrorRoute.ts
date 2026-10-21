import { AppError } from "@/core/errors";
import { error } from "@/core/response";
import { AppEnv } from "@/types";
import { SQL } from "bun";
import { Context } from "hono";
import { ZodError } from "zod";

export function handleErrorRoute(err: any, c: Context<AppEnv>) {

    if (err instanceof ZodError) {
        const message = JSON.parse(err.message);
        return error(c, message, "ERROR_VALIDATION", 400);
    }

    if (err instanceof SQL.PostgresError) {
        return error(c, err.message, "PostgresError", 400);
    }

    if (err instanceof AppError){
        return error(c, err.message, "APP_ERROR", 400);
    }

    console.error(err)
    return c.text('Internal Server Error', 500);
}