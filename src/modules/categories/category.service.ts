import { FindOptionInput } from "@/schema/find.option.schema";
import { categoryRepository, CategoryRepository } from "./category.respository";
import { CategoryInput, CategoryInputItems } from "./category.validation";
import { Category } from "./category.model";

export class CategoryService{

    constructor(private repo: CategoryRepository = categoryRepository){}

    async findAll({ page = 1, limit = 20, search = "" } : FindOptionInput) {

        const offset = (page - 1) * limit;

        const find = this.repo.find({
            withDeleted: false,
            limit,
            offset,
            where: {
                name: { $like: search }
            }
        });

        const [items,count] = await Promise.all([
            find,
            this.repo.count()
        ]);

        return { items, count }
    }

    async findById(id: number){
        const result = await this.repo.findById(id);
        return result;
    }

    async create({ items } : CategoryInputItems) {
        const createCategory = await this.repo.insertBulk(items as any);
        return createCategory;
    }
    async update(id: number, data: Partial<Category>){
        const update = await this.repo.update(id, data);
        return update;
    }

    async softDelete(id: number) {
        await this.repo.softDelete(id);
        return 'Remove category successfully.';
    }

}

export const categoryService = new CategoryService();