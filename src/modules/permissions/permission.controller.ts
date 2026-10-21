import { Context } from "hono";
import { permissionService, PermissionService } from "./permission.service";
import { AppEnv } from "@/types";
import { ok } from "@/core/response";
import { createPermissionSchema, idParamSchema } from "./permission.validation";
import { CreatePermission } from "./permission.model";

export class PermissionController{

    constructor(private service: PermissionService = permissionService){}

    async find(c: Context<AppEnv>) {
        const result = await this.service.find();
        return ok(c, result, "OK", 200);
    }

    async findSoftDelete(c: Context<AppEnv>) {
        const result = await this.service.findSoftDeleted();
        return ok(c, result, "Permission Data Soft deleted...", 200);
    }

    async create(c: Context<AppEnv>){
        const bodyJson = await c.req.json();
        const parsed = createPermissionSchema.parse(bodyJson);
        const create = await this.service.create(parsed as CreatePermission);
        return ok(c, create, "New Create Permission Successfully", 201);
    }

    async update(c: Context<AppEnv>){
        const { id } = idParamSchema.parse(c.req.param());
        const bodyJson = await c.req.json();
        const update = await this.service.update(id, bodyJson);

        return ok(c, update, `Update permission id ${id} successfully.`, 202);
    }

    async softDelete(c: Context<AppEnv>) {
        const { id } = idParamSchema.parse(c.req.param());
        const result = await this.service.softDelete(id);
        return ok(c, result, "Remove Permission", 200);
    }
    
    async restore(c: Context<AppEnv>){
        const { id } = idParamSchema.parse(c.req.param());
        const result = await this.service.restore(id);
        return ok(c, result, `Restore permission id ${id} successfully.`, 200);
    }
}