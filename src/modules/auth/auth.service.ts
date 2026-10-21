import { sign } from "hono/jwt";
import { env } from "@/config/env";
import { ConflictError, UnauthorizedError } from "@/core/errors";
import { toPublicUser, type User } from "../user/user.model";
import { userRepository, type UserRepository } from "../user/user.repository";
import type { AuthResult } from "./auth.model";
import type { LoginInput, RegisterInput } from "./auth.validation";

export class AuthService {
  constructor(private users: UserRepository = userRepository) {}

  async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await this.users.findByEmail(input.email);
    if (existing) throw new ConflictError("Email already registered");

    const password = await Bun.password.hash(input.password, {
      algorithm: "bcrypt",
      cost: 4
    });

    const user = await this.users.create({ ...input as any, password });
    return this.buildAuthResult(user);
  }

  async login(input: LoginInput): Promise<AuthResult | any> {

    const user = await this.users.findByEmail(input.email);
    const valid = user && (await Bun.password.verify(input.password, user.password, 'bcrypt'));

    if (!user || !valid) throw new UnauthorizedError("Invalid email or password");
    return this.buildAuthResult(user);
  }

  async me(userId: string) {
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedError("User no longer exists");
    return toPublicUser(user);
  }

  private async buildAuthResult(user: User): Promise<AuthResult> {
    const accessToken = await sign(
      {
        sub: user.id,
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + env.JWT_EXPIRES_IN,
      },
      env.JWT_SECRET,
      "HS256",
    );

    return {
      user: toPublicUser(user),
      accessToken,
      tokenType: "Bearer",
      expiresIn: env.JWT_EXPIRES_IN,
    };
  }
}

export const authService = new AuthService();
