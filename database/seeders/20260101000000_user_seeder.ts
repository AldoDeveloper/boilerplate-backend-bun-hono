import type { SQL } from "bun";

export async function seed(sql: SQL) {
  const password = await Bun.password.hash("password123");

  const users = [
    { name: "Administrator", email: "admin@example.com", role: "admin" },
    { name: "User Demo", email: "user@example.com", role: "user" },
  ];

  for (const u of users) {
    await sql`
      INSERT INTO users (name, email, password, role)
      VALUES (${u.name}, ${u.email}, ${password}, ${u.role})
      ON CONFLICT (email) DO NOTHING
    `;
  }
}
