import { NotFoundError } from "@/core/errors";
import { toPublicUser } from "./user.model";
import { userRepository, type UserRepository } from "./user.repository";

export class UserService {
  constructor(private repo: UserRepository = userRepository) {}

  async list(page: number, limit: number) {
    const offset = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.repo.findAll(limit, offset),
      this.repo.count(),
    ]);
    return { items: users.map(toPublicUser), total };
  }

  async getById(id: string) {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundError("User not found");
    return toPublicUser(user);
  }
}

export const userService = new UserService();
