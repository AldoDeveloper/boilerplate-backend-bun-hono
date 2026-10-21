import { authMiddleware } from "@/middlewares/auth.middleware";
import { AppEnv } from "@/types";
import { Hono } from "hono";
import { PermissionController } from "./permission.controller";
import { handleErrorRoute } from "@/utils/handleErrorRoute";

export const permission = new Hono<AppEnv>();
const permissionController = new PermissionController();

permission.use('*', authMiddleware);
permission.get('/', (c) =>  permissionController.find(c))
permission.get('/soft-delete', (c) =>  permissionController.findSoftDelete(c))
permission.post('/', (c) => permissionController.create(c));
permission.patch('/:id', (c) => permissionController.update(c));
permission.delete('/:id', (c) => permissionController.softDelete(c));
permission.get('/restore/:id', (c) => permissionController.restore(c));


permission.onError(handleErrorRoute);

export default permission;