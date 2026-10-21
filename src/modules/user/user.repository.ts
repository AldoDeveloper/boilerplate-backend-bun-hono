import { sql } from "@/config/database";
import type { CreateUserData, User } from "./user.model";

type UserRow = {
  id: string;
  name: string;
  email: string;
  username: string;
  password: string;
  is_active: boolean;
  is_super_admin: boolean;
  created_at: Date;
  updated_at: Date;
};

const mapRow = (r: UserRow): User => ({
  id: r.id,
  name: r.name,
  email: r.email,
  username: r.username,
  password: r.password,
  created_at: r.created_at,
  updated_at: r.updated_at,
});

export class UserRepository {
  async findAll(limit: number, offset: number): Promise<User[]> {
    const rows = (await sql`
      SELECT * FROM users ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
    `) as UserRow[];
    return rows.map(mapRow);
  }

  async count(): Promise<number> {
    const [row] = await sql`SELECT COUNT(*)::int AS total FROM users`;
    return row.total as number;
  }

  async findById(id: string): Promise<User | null> {
    const [row] = (await sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`) as UserRow[];
    return row ? mapRow(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [row] = (await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`) as UserRow[];
    return row ? mapRow(row) : null;
  }

  async create(data: CreateUserData): Promise<User> {
    const [row] = (await sql`
      INSERT INTO users ${sql(data)}
      RETURNING *
    `) as UserRow[];
    return mapRow(row);
  }
}

export const userRepository = new UserRepository();
