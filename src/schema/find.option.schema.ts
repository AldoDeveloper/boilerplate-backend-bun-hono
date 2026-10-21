import * as z from "zod";

export const findOptionSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(20).default(20),
  search: z.string().default(''),
  orderBy: z.string().optional(),
  order: z.enum(['desc', 'asc']).optional(),
});

export type FindOptionInput = z.infer<typeof findOptionSchema>;
