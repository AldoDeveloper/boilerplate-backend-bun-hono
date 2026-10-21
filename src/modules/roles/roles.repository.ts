import { sql } from "@/config/database";
import { Repository } from "@/core/repository";

export class RolesRepositori extends Repository{

  protected TABLE_NAME: string = 'roles';

  constructor() {
    super(sql)
  }

  async getRolePermissionByRoleId<T = any>(role_id: string): Promise<T| null>{
    const role_permission = await sql<T[]>`SELECT * FROM view_role_permissions WHERE role_id = ${role_id} LIMIT 1`;
    return role_permission.length > 0 ? role_permission[0] : null;
  }

  async getRolePermissions<T = any>(){
    const rows = await sql<T[]>`SELECT * from view_role_permissions`;
    return rows;
  }

  async getUserRoles<T = any>(){
    const rows = await sql<T[]>`SELECT * FROM view_user_roles`;
    return rows;
  }

}

export const roleRepository = new RolesRepositori();
