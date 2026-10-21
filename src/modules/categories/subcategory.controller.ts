import { Context } from "hono";
import { subCategoryService, SubCategoryService } from "./subcategory.service";
import { AppEnv } from "@/types";
import { createSubCategoryItemSchema, idCategoryParamSchema } from "./category.validation";
import { findOptionSchema } from "@/schema/find.option.schema";
import { ok } from "@/core/response";

export class SubcategoryController{

    constructor(private service: SubCategoryService = subCategoryService) {}

    async findAll(c: Context<AppEnv>) {
        const { id } = idCategoryParamSchema.parse(c.req.param());
        const queryParsed = findOptionSchema.parse(c.req.query());

        const result = await this.service.findAll(id as number, queryParsed);
        return ok(c, result, 'OK', 200);
    }

    async create(c: Context<AppEnv>){
        const parsedBody = createSubCategoryItemSchema.parse(await c.req.json());
        const result = await this.service.create(parsedBody);
        return ok(c, result, 'Created', 201);
    }
}