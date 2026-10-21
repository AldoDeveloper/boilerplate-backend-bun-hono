import { Context, Next } from "hono";
import { roleService, type RoleServices } from "./roles.service";
import { AppEnv } from "@/types";
import { ok, paginated } from "@/core/response";
import { findOptionSchema } from "@/schema/find.option.schema";
import { createItemsRoleSchema, createRolePermission, createUserRole, idParamSchema } from "./roles.validation";
import { CreateRolesData } from "./roles.model";

export class RolesController{

  constructor(private service: RoleServices = roleService) {}

  async findAll(c: Context<AppEnv>, next: Next) {

    const parsed = findOptionSchema.parse(c.req.query());
    const { items, total  } = await this.service.findAll(parsed);
    return paginated(c, items, { page: parsed.page, limit: parsed.limit, total });
  }

  async findById(c: Context<AppEnv>) {
    const { id } = idParamSchema.parse(c.req.param());
    const result = await this.service.findById(id);
    return ok(c as any, result, "find by id roles...", 200);
  }

  async create(c: Context<AppEnv>) {

    const bodyJson = await c.req.json();
    const parsed = createItemsRoleSchema.parse(bodyJson);
    const result = await this.service.create(parsed.items as CreateRolesData[]);
    return ok(c as any, result, "CREATE", 200);
  }

  async createRolePermissionByRoleId(c: Context<AppEnv>){
    const createRolePermissionParse = createRolePermission.parse(await c.req.json());
    const createNewRolePermission = await this.service.createRolePermission(createRolePermissionParse);

    return ok(c, createNewRolePermission, "CREATED", 201);
  }
  async createUserRolesByUserId(c: Context<AppEnv>){
    
    const createUserRoleParse = createUserRole.parse(await c.req.json());
    const createUserRoleService = await this.service.createUserRoles(createUserRoleParse);

    return ok(c, createUserRoleService, "UPSERT", 201);
  }

  async getRolePermissionsByRoleId(c: Context<AppEnv>){
    const { id} = idParamSchema.parse(c.req.param());
    const result =  await this.service.getRolePermissionByRoleId(id);
    return ok(c, result, "GET", 200);
  }

  async getRolePermissions(c: Context<AppEnv>){
    const result = await this.service.getRolePermissions();
    return ok(c, result, "ROLE PERMISSIONS", 200);
  }

  async getUserRoles(c: Context<AppEnv>){
    const result = await this.service.getUserRoles();
    return ok(c, result, "USER ROLES");
  }

  async update(c: Context<AppEnv>) {
    return ok(c as any, {}, "update", 200);
  }

  async remove(c: Context<AppEnv>) {
    return ok(c as any, {}, "remove", 200);
  }
}
