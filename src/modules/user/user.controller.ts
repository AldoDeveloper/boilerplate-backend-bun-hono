import type { Context } from "hono";
import { ok, paginated } from "../../core/response";
import type { AppEnv } from "../../types";
import { userService, type UserService } from "./user.service";
import { idParamSchema, listQuerySchema } from "./user.validation";

export class UserController {
  constructor(private service: UserService = userService) {}

  list = async (c: Context<AppEnv>) => {
    const { page, limit } = listQuerySchema.parse(c.req.query());
    const { items, total } = await this.service.list(page, limit);
    return paginated(c, items, { page, limit, total }, "Users retrieved");
  };

  show = async (c: Context<AppEnv>) => {
    const { id } = idParamSchema.parse(c.req.param());
    const user = await this.service.getById(id);
    return ok(c, user, "User retrieved");
  };
}
