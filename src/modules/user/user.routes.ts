import { Hono } from "hono";
import { authMiddleware, requireRole } from "@/middlewares/auth.middleware";
import type { AppEnv } from "@/types";
import { UserController } from "./user.controller";

const user = new Hono<AppEnv>();
const controller = new UserController();

user.use("*", authMiddleware);
user.get("/", requireRole("admin"), controller.list);
user.get("/:id", requireRole("admin"), controller.show);

export default user;
