import { subCategoryRepository, SubCategoryRepository } from "./category.respository";
import { FindOptionInput } from "@/schema/find.option.schema";
import { SubCategoryInputItems } from "./category.validation";

export class SubCategoryService{

    constructor(private repo : SubCategoryRepository = subCategoryRepository){}

    async findAll(category_id: number, { page = 1, limit = 20, search } : FindOptionInput) {

        const offset = (page - 1) * limit;

        const result  = await this.repo.find({
            limit,
            offset,
            where: {
                category_id: {
                    $eq: category_id
                },
                name: {
                    $like: search
                }
            }
        });

        return result;
    }

    async create({ items } : SubCategoryInputItems){
        const insertBulk = await this.repo.insertBulk(items as any);
        return insertBulk;
    }
}

export const subCategoryService = new SubCategoryService();