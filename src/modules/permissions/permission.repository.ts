import { Repository } from "@/core/repository";
import { Permission } from "./permission.model";
import { sql } from "@/config/database";

export class PermissionRepository extends Repository<Permission>{

    protected TABLE_NAME: string = 'permissions';
    
    constructor() {
        super(sql)
    }

}

export const permissionRepo = new PermissionRepository();