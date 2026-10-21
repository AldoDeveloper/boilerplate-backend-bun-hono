import { Repository } from "@/core/repository";
import { Category, SubCategory } from './category.model'
import { sql } from "@/config/database";

export class CategoryRepository extends Repository<Category>{

    protected TABLE_NAME: string = 'categories';

    constructor() {
        super(sql)
    }
}


export class SubCategoryRepository extends Repository<SubCategory>{

  protected TABLE_NAME: string ='sub_categories';
  constructor() {
    super(sql)
  }

}

export const categoryRepository = new CategoryRepository();
export const subCategoryRepository = new SubCategoryRepository();