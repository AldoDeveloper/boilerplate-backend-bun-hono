
export interface Roles{
  id: string;
  role_key: string;
  role_name: string;
  deleted_at: Date | string;
};

export interface RolePermission{
  role_id: string;
  permision_id: string;
}

export interface PayloadRolePermission{
  role_id: string;
  role_key: string;
  role_name: string;
  permissions : Array<{
    role_id: string;
    permission_key: string;
    permission_name: string;
    action: string
  }>
}

export type CreateRolesData = Omit<Roles, 'id' | 'deleted_at'>;