import { FindOptionInput } from "@/schema/find.option.schema";
import { roleRepository, type RolesRepositori } from "./roles.repository";
import { queryFindOption } from "@/utils/queryFindOptions";
import { CreateRolesData, PayloadRolePermission } from "./roles.model";
import { RolePermissionInput, UserRoleInput } from "./roles.validation";
import { sql } from "@/config/database";
import { AppError } from "@/core/errors";
import { Repository } from "@/core/repository";
import { userRepository, UserRepository } from "../user/user.repository";

export class RoleServices{

  constructor(
    private repo: RolesRepositori = roleRepository,
    private repoUser: UserRepository = userRepository,
  ) {}

  async findAll({ limit, page, order, orderBy, search }: FindOptionInput) {

    const queryOption = queryFindOption({
      tableName: 'roles',
      select: ["id", "role_key", "role_name"],
      option: {
        limit,
        page,
        order,
        orderBy,
        search
      }
    });

    const [items, total] = await Promise.all([queryOption, this.repo.count()]);
    return { items, total };
  }

  async create(roles: CreateRolesData[]) {
    return await this.repo.create(roles);
  }

  async createRolePermission({ role_id, permission_ids }: RolePermissionInput){

    const role = await this.repo.findById(role_id);
    
    //if role not found kembalikan AppError
    if(!role) throw new AppError(`Role id ${role_id} not found.`);
    
    const role_permissions = permission_ids.map((permission_id) => ({ role_id, permission_id }))

    await Repository.transaction(async(tx) => {

      await tx`DELETE FROM role_permissions WHERE role_id = ${role_id}`;

      if(role_permissions.length > 0){
        await tx`INSERT INTO role_permissions ${sql(role_permissions)}`
      }
      
     }, sql);

     return "create role permissions successfully."
  }

  async createUserRoles({ user_id, role_ids} : UserRoleInput){
     
    const user = await this.repoUser.findById(user_id);

    if(!user) throw new AppError(`User id ${user_id} not found.`);

    const map_usr_roles = role_ids.map((role_id) =>  ({ user_id, role_id }));

    await Repository.transaction(async(tx) => {

      await tx`DELETE FROM user_roles WHERE user_id = ${user_id}`;

      if(map_usr_roles.length > 0){
        await tx`INSERT INTO user_roles ${sql(map_usr_roles)}`
      }

    }, sql);

     return "create user roles successfully."
  }

  async getRolePermissionByRoleId(role_id: string){
      const result = await this.repo.getRolePermissionByRoleId<PayloadRolePermission>(role_id);
      return result;
  }

  async getRolePermissions() {
    const result = await this.repo.getRolePermissions<PayloadRolePermission>();
    return result;
  }

  async getUserRoles() {
    const result = await this.repo.getUserRoles();
    return result;
  }

  async findById(id: string) {
    return await this.repo.findById(id);
  }

  async update(id: string, role: Partial<CreateRolesData>){
    return await this.repo.update(id, role)
  }

  async softDelete(id: string){
    return await this.repo.softDelete(id);
  }

};

export const roleService = new RoleServices();
