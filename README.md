# Hono + Bun Boilerplate

Backend monolit dengan arsitektur berlapis: **Routes → Controller → Service → Repository → Model**, plus Middleware.
Database: PostgreSQL via `Bun.sql` (tanpa ORM / library tambahan).

## Setup

```bash
bun install
cp .env.example .env      # sesuaikan DATABASE_URL & JWT_SECRET
bun run migrate
bun run db:seed
bun run dev
```

## Struktur

```
src/
├── config/          env & koneksi Bun.sql
├── core/            AppError & response helper
├── middlewares/     auth (JWT + role), error handler
├── modules/
│   └── auth/        routes, controller, service, validation, model
│   └── user/        routes, controller, service, repository, validation, model
├── routes/          registrasi semua module (/api/v1)
├── types/
├── app.ts
└── index.ts
cli/                 CLI migration & seeder
database/
├── migrations/      file .sql (-- +migrate Up / Down)
└── seeders/         file .ts (export async function seed(sql))
```

## CLI

| Perintah | Fungsi |
|---|---|
| `bun run make:migration create_posts_table` | Buat file migration |
| `bun run make:seeder post_seeder` | Buat file seeder |
| `bun run migrate` | Jalankan migration pending |
| `bun run migrate:rollback` | Rollback batch terakhir (`-- --step=2` untuk 2 terakhir) |
| `bun run migrate:fresh` | Drop semua tabel + migrate ulang (`-- --seed` untuk seed) |
| `bun run migrate:status` | Status migration |
| `bun run db:seed` | Jalankan semua seeder (`-- --class=user` untuk filter) |

## Endpoint

| Method | Path | Akses |
|---|---|---|
| POST | `/api/v1/auth/register` | Public |
| POST | `/api/v1/auth/login` | Public |
| GET | `/api/v1/auth/me` | Bearer token |
| GET | `/api/v1/users?page=1&limit=10` | Admin |
| GET | `/api/v1/users/:id` | Admin |
| GET | `/health` | Public |

Akun seeder: `admin@example.com` / `user@example.com`, password `password123`.

## Menambah module baru

1. Buat folder `src/modules/<nama>/` berisi `*.model.ts`, `*.repository.ts`, `*.service.ts`, `*.controller.ts`, `*.validation.ts`, `*.routes.ts`.
2. Daftarkan di `src/routes/index.ts`: `routes.route("/<nama>", namaRoutes)`.
3. `bun run make:migration create_<nama>_table`.

## Docker

Menjalankan app + PostgreSQL + Redis sekaligus:

```bash
cp .env.example .env
docker compose up -d --build
docker compose logs -f app
```

- App: http://localhost:3000 (migration dijalankan otomatis saat container `app` start)
- Seeder: `docker compose exec app bun run cli/index.ts db:seed`
- Hentikan: `docker compose down` (tambah `-v` untuk hapus data volume)

Hanya PostgreSQL + Redis (app jalan lokal dengan `bun run dev`):

```bash
docker compose up -d postgres redis
```

Redis tersedia lewat `import { redis } from "./config/redis"`.
