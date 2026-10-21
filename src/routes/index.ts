import { Hono } from "hono";
import authRoutes from "@/modules/auth/auth.routes";
import userRoutes from "@/modules/user/user.routes";
import rolesRoutes from "@/modules/roles/roles.route";
import permissionRoutes from '@/modules/permissions/permission.routes';
import categoryRoutes from '@/modules/categories/category.routes';
import type { AppEnv } from "@/types";

const routes = new Hono<AppEnv>();

// Daftarkan setiap module di sini
routes.route("/auth", authRoutes);
routes.route("/users", userRoutes);
routes.route('/roles', rolesRoutes);
routes.route('/permission', permissionRoutes);
routes.route('/categories', categoryRoutes)
export default routes;
