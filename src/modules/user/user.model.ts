import type { UserRole } from "@/types";

export interface User {
  id: string;
  name: string;
  email: string;
  username: string | null;
  password: string;
  created_at: Date | string;
  updated_at: Date | string;
}

export type PublicUser = Omit<User, "password">;

export interface CreateUserData {
  name: string;
  email: string;
  username ?: string;
  password: string;
}

export const toPublicUser = (user: User): PublicUser => {
  const { password: _password, ...rest } = user;
  return rest;
};
