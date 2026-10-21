import type { Context } from "hono";
import { ok } from "@/core/response";
import type { AppEnv } from "@/types";
import { authService, type AuthService } from "./auth.service";
import { loginSchema, registerSchema } from "./auth.validation";

export class AuthController {
  
  constructor(private service: AuthService = authService) {}

  async register(c: Context<AppEnv>){

    const input = registerSchema.parse(await c.req.json());
    const query = c.req.query();

    if(query.test){
      return ok(c, 'Testing Registration Success.', "Registration successful", 201);
    }

    const result = await this.service.register(input);
    return ok(c, result, "Registration successful", 201);
  };

  async login (c: Context<AppEnv>) {
    const input = loginSchema.parse(await c.req.json());
    const result = await this.service.login(input);
    return ok(c, result, "Login successful");
  };

  async me (c: Context<AppEnv>) {
    const { id } = c.get("user");
    const user = await this.service.me(id);
    return ok(c, user, "Profile retrieved");
  };
}
