import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export const ok = <T>(
  c: Context,
  data: T,
  message = "Success",
  status: ContentfulStatusCode = 200,
) => c.json({ success: true, message, data }, status);

export const paginated = <T>(
  c: Context,
  items: T[],
  meta: { page: number; limit: number; total: number },
  message = "Success",
) =>
  c.json({
    success: true,
    message,
    data: items,
    meta: { ...meta, totalPages: Math.ceil(meta.total / meta.limit) },
  });

export const error = (
  c: Context,
  data: any,
  message: string =  "Terjadi Kesalahan",
  status: ContentfulStatusCode = 400) => {

  const isError = status >= 400;

  const errors = {
    isError,
    message,
    errors: data,
  };

  return c.json(errors, status);
}
