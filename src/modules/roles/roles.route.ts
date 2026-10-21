import { AppEnv } from "@/types";
import { Hono } from "hono";
import { RolesController } from "./roles.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { handleErrorRoute } from "@/utils/handleErrorRoute";

const roles = new Hono<AppEnv>();
const rolesController = new RolesController();

roles.use('*', authMiddleware);
roles.get('/', (c, next)    => rolesController.findAll(c, next));
roles.post('/', (c, _)      => rolesController.create(c));
roles.patch('/:id',(c, _)   => rolesController.update(c));
roles.delete('/:id', (c, _) => rolesController.remove(c));
roles.get('/:id', (c, _)    => rolesController.findById(c));

//route role permissions
roles.put('/role-permission', (c, _)     => rolesController.createRolePermissionByRoleId(c));
roles.get('/role-permission/:id', (c, _) => rolesController.getRolePermissionsByRoleId(c));
roles.get('/role-permission/', (c, _)    => rolesController.getRolePermissions(c));

//route user role
roles.get('/user-roles/', (c, _) => rolesController.getUserRoles(c));
roles.put('/user-roles', (c, _)  => rolesController.createUserRolesByUserId(c));

//app error route handler
roles.onError(handleErrorRoute)

export default roles;
