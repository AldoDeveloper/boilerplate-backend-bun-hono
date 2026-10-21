import { Hono } from "hono";
import { authMiddleware } from "@/middlewares/auth.middleware";
import type { AppEnv } from "@/types";
import { AuthController } from "./auth.controller";

const auth = new Hono<AppEnv>();
const controller = new AuthController();

auth.post("/register", (c, _) => controller.register(c));
auth.post("/login",    (c, _) => controller.login(c));
auth.get("/me", authMiddleware, (c, _) => controller.me(c));

export default auth;
