import * as z from 'zod'

export const createCategorySchema = z.object({
    name: z.string(),
    description: z.string().optional().nullable(),
    status: z.boolean().optional().default(true),
});

export const createSubCategorySchema = z.object({
    name: z.string(),
    category_id: z.number().int(),
    description: z.string().optional().nullable(),
    status: z.boolean().optional().default(true),
});

export const createCategoryItemSchema = z.object({
    items: z.array(createCategorySchema)
});

export const createSubCategoryItemSchema = z.object({
    items: z.array(createSubCategorySchema)
});

export const idCategoryParamSchema = z.object({
   id: z.string().transform((val) => {
        const parsed = Number(val);
        if (isNaN(parsed)) return val; // Biarkan skema selanjutnya menangani jika bukan angka
        return parsed;
  })
});

export type CategoryInput = z.infer<typeof createCategorySchema>;
export type CategoryInputItems = z.infer<typeof createCategoryItemSchema>;

export type SubCategoryInput = z.infer<typeof createSubCategorySchema>;
export type SubCategoryInputItems = z.infer<typeof createSubCategoryItemSchema>;