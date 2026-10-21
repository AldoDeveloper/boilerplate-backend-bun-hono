import { Context } from "hono";
import { categoryService, CategoryService } from "./category.service";
import { AppEnv } from "@/types";
import { ok, paginated } from "@/core/response";
import { findOptionSchema } from "@/schema/find.option.schema";
import { createCategoryItemSchema, idCategoryParamSchema } from "./category.validation";

export class CategoryController{

    constructor(private service: CategoryService = categoryService) {}

    async findAll(c: Context<AppEnv>) {

        const parsed = findOptionSchema.parse(c.req.query());
        const { items, count } = await this.service.findAll(parsed);

        return paginated(c, items, {
            page: parsed.page,
            limit: parsed.limit,
            total: count
        })
    }

    async findById(c: Context<AppEnv>){
        const { id } = idCategoryParamSchema.parse(c.req.param());
        const result = await this.service.findById(Number(id));
        return ok(c, result, "OK", 200);
    }   

    async create(c: Context<AppEnv>) {
        const parsed = createCategoryItemSchema.parse(await c.req.json());
        const result = await this.service.create(parsed);
        return ok(c, result, "CREATED", 201);
    }

    async update(c: Context<AppEnv>){
        const { id } = idCategoryParamSchema.parse(c.req.param());
        const body = await c.req.json()
        const result = await this.service.update(id as number, body);
        return ok(c, result, "UPDATE");
    }

    async softDelete(c: Context<AppEnv>){
        const { id } = idCategoryParamSchema.parse(c.req.param());
        const result = await this.service.softDelete(id as number);
        return ok(c, result, "OK", 200);
    }
}