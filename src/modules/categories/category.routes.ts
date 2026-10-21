import { AppEnv } from "@/types";
import { Hono } from "hono";
import { CategoryController } from "./category.controller";
import { handleErrorRoute } from "@/utils/handleErrorRoute";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { SubcategoryController } from "./subcategory.controller";

const category = new Hono<AppEnv>();

const categoryController = new CategoryController();
const subcategoryController = new SubcategoryController();

category.use('*', authMiddleware);

category.get('/',       (c) => categoryController.findAll(c));
category.get('/:id',    (c) => categoryController.findById(c));
category.post('/',      (c) => categoryController.create(c));
category.patch('/:id',  (c) => categoryController.update(c));
category.delete('/:id', (c) => categoryController.softDelete(c));  

category.get('/:id/sub-categories', (c) => subcategoryController.findAll(c))
category.post('/sub-categories', (c) => subcategoryController.create(c))

category.onError(handleErrorRoute);
export default category;