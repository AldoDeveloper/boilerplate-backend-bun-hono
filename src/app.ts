import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
import routes from "./routes";
import type { AppEnv } from "./types";

const app = new Hono<AppEnv>();

app.use("*", logger());
app.use("*", secureHeaders());
app.use("*", cors());

app.get("/health", (c) => c.json({ status: "ok", uptime: process.uptime() }));
app.route("/api/v1", routes);

app.onError(errorHandler);
app.notFound(notFoundHandler);

export default app;
