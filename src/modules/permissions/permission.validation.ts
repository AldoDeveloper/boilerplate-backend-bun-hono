
import * as z from 'zod';

export const createPermissionSchema = z.object({
    permission_key: z.string().min(2),
    permission_name: z.string().min(2),
    action: z.enum(['CREATE', 'READ' , 'UPDATE', 'DELETE']),
    description: z.string().optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid()
});

export type PermissionInput = z.infer<typeof createPermissionSchema>;