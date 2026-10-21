import * as z from 'zod';

export const createRoleSchema = z.object({
  role_key: z.string().min(2).max(200),
  role_name: z.string().min(2).max(200)
});

export const createRolePermission = z.object({
  role_id: z.string().uuid(),
  permission_ids: z.array(z.string().uuid())
});

export const createUserRole = z.object({
   user_id: z.string().uuid(),
   role_ids: z.array(z.string().uuid()),
})

export const createItemsRoleSchema = z.object({
  items: z.array(createRoleSchema).min(1),
});

export const idParamSchema = z.object({
  id: z.string().uuid()
});

export const useIdParamSchema = z.object({
  user_id: z.string().uuid()
});

export type RolesInput = z.infer<typeof createItemsRoleSchema>;
export type RolePermissionInput = z.infer<typeof createRolePermission>;
export type UserRoleInput = z.infer<typeof createUserRole>;
