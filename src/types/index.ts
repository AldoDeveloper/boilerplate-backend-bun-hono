export type UserRole = "admin" | "user";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

// Tipe environment Hono (c.get("user"))
export type AppEnv = {
  Variables: {
    user: AuthUser;
  };
};

export interface IFindOption{
  page: number;
  limit: number;
  search: string;
  orderBy?: string;
  order?: "desc" | "asc";
}
