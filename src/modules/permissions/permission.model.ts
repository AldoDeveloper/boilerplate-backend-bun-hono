
export type ActionPermission = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';

export interface Permission{
    id: string;
    permission_key: string;
    permission_name: string;
    action: ActionPermission;
    description: string;
    deleted_at: string | Date;
}

export type CreatePermission = Omit<Permission, 'id' | 'deleted_at'>;