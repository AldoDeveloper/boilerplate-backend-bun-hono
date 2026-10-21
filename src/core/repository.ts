import { sql as defaultSql, type SQL } from "bun";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export interface FieldOperators<V> {
  $eq?: V; // =
  $ne?: V; // !=
  $gt?: V; // >
  $gte?: V; // >=
  $lt?: V; // <
  $lte?: V; // <=
  $like?: string; // LIKE (otomatis dibungkus %...% jika tidak ada wildcard)
  $in?: V[]; // IN (...)
  $nin?: V[]; // NOT IN (...)
  $isNull?: boolean; // true = IS NULL, false = IS NOT NULL
}

export type WhereClauseOption<T> = {
  [K in keyof T]?: T[K] | FieldOperators<T[K]> | null;
};

export interface FindOption<T> {
  where?: WhereClauseOption<T>;
  select?: (keyof T)[];
  orderBy?: { [K in keyof T]?: "ASC" | "DESC" };
  limit?: number;
  offset?: number;
  /** Sertakan baris yang sudah di-soft delete (default: false) */
  withDeleted?: boolean;
}

type Params = unknown[];

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const IDENT_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

/** Validasi + quote identifier (nama tabel/kolom) agar aman dari SQL injection */
function ident(name: string): string {
  if (!IDENT_REGEX.test(name)) {
    throw new Error(`Invalid SQL identifier: "${name}"`);
  }
  return `"${name}"`;
}

const OPERATOR_KEYS = new Set([
  "$eq", "$ne", "$gt", "$gte", "$lt", "$lte",
  "$like", "$in", "$nin", "$isNull",
]);

/** Object dianggap operator jika plain object & semua key diawali operator valid */
function isOperatorObject(v: unknown): v is Record<string, unknown> {
  if (v === null || typeof v !== "object") return false;
  if (Array.isArray(v) || v instanceof Date || v instanceof Uint8Array) return false;
  const keys = Object.keys(v);
  return keys.length > 0 && keys.every((k) => OPERATOR_KEYS.has(k));
}

/* ------------------------------------------------------------------ */
/* Repository                                                         */
/* ------------------------------------------------------------------ */

export abstract class Repository<TYPE extends Record<string, any> = any> {
  /** Nama tabel (wajib di-override oleh turunan) */
  protected abstract readonly TABLE_NAME: string;

  /** Primary key, default "id" */
  protected readonly PRIMARY_KEY: string = "id";

  /** Nama kolom soft delete. Isi `null` jika tabel tidak pakai soft delete */
  protected readonly SOFT_DELETE_COLUMN: string | null = "deleted_at";

  /** Koneksi DB, default memakai `Bun.sql` (baca DATABASE_URL / POSTGRES_URL) */
  protected readonly db: SQL;

  constructor(db: SQL = defaultSql) {
    this.db = db;
  }

  /* ---------------------------- TRANSACTION --------------------------- */

  /**
   * Transaksi lintas banyak repository.
   * Otomatis COMMIT jika sukses dan ROLLBACK jika callback melempar error.
   *
   * await Repository.transaction(async (tx) => {
   *   const users = new UserRepository().withTransaction(tx);
   *   const orders = new OrderRepository().withTransaction(tx);
   *   ...
   * });
   */
  static transaction<R>(fn: (tx: SQL) => Promise<R>, db: SQL = defaultSql): Promise<R> {
    return db.begin(fn as any) as Promise<R>;
  }

  /** Salinan repository ini yang semua query-nya memakai koneksi transaksi `tx` */
  withTransaction(tx: SQL): this {
    const clone = Object.create(Object.getPrototypeOf(this));
    Object.assign(clone, this, { db: tx });
    return clone;
  }

  /**
   * Transaksi dengan repo ini sebagai titik awal; callback menerima
   * salinan repo yang sudah terikat ke transaksi, plus `tx` untuk repo lain.
   */
  transaction<R>(fn: (repo: this, tx: SQL) => Promise<R>): Promise<R> {
    return this.db.begin(((tx: SQL) => fn(this.withTransaction(tx), tx)) as any) as Promise<R>;
  }

  /* ----------------------------- internal ----------------------------- */

  protected get table(): string {
    return ident(this.TABLE_NAME);
  }

  protected async query<R = TYPE>(text: string, params: Params = []): Promise<R[]> {
    return (await this.db.unsafe(text, params as any[])) as unknown as R[];
  }

  /** Menambah value ke params dan mengembalikan placeholder ($1, $2, ...) */
  private bind(params: Params, value: unknown): string {
    params.push(value);
    return `$${params.length}`;
  }

  /** Bangun klausa WHERE dari WhereClauseOption (mutasi `params`) */
  protected buildWhere(
    where: WhereClauseOption<TYPE> | undefined,
    params: Params,
    withDeleted = false,
  ): string {
    const conds: string[] = [];

    if (this.SOFT_DELETE_COLUMN && !withDeleted) {
      conds.push(`${ident(this.SOFT_DELETE_COLUMN)} IS NULL`);
    }

    for (const [key, raw] of Object.entries(where ?? {})) {
      if (raw === undefined) continue;
      const col = ident(key);

      if (raw === null) {
        conds.push(`${col} IS NULL`);
        continue;
      }

      if (!isOperatorObject(raw)) {
        conds.push(`${col} = ${this.bind(params, raw)}`);
        continue;
      }

      for (const [op, val] of Object.entries(raw)) {
        if (val === undefined) continue;

        switch (op) {
          case "$eq":
            conds.push(val === null ? `${col} IS NULL` : `${col} = ${this.bind(params, val)}`);
            break;
          case "$ne":
            conds.push(val === null ? `${col} IS NOT NULL` : `${col} != ${this.bind(params, val)}`);
            break;
          case "$gt":
            conds.push(`${col} > ${this.bind(params, val)}`);
            break;
          case "$gte":
            conds.push(`${col} >= ${this.bind(params, val)}`);
            break;
          case "$lt":
            conds.push(`${col} < ${this.bind(params, val)}`);
            break;
          case "$lte":
            conds.push(`${col} <= ${this.bind(params, val)}`);
            break;
          case "$like": {
            const s = String(val);
            const pattern = /[%_]/.test(s) ? s : `%${s}%`;
            conds.push(`${col} LIKE ${this.bind(params, pattern)}`);
            break;
          }
          case "$in":
          case "$nin": {
            const arr = val as unknown[];
            if (arr.length === 0) {
              // IN () selalu false, NOT IN () selalu true
              conds.push(op === "$in" ? "FALSE" : "TRUE");
              break;
            }
            const phs = arr.map((v) => this.bind(params, v)).join(", ");
            conds.push(`${col} ${op === "$in" ? "IN" : "NOT IN"} (${phs})`);
            break;
          }
          case "$isNull":
            conds.push(val ? `${col} IS NULL` : `${col} IS NOT NULL`);
            break;
        }
      }
    }

    return conds.length ? `WHERE ${conds.join(" AND ")}` : "";
  }

  /* ------------------------------- READ -------------------------------- */

  async find(option: FindOption<TYPE> = {}): Promise<TYPE[]> {
    const params: Params = [];

    const cols = option.select?.length
      ? option.select.map((c) => ident(String(c))).join(", ")
      : "*";

    const where = this.buildWhere(option.where, params, option.withDeleted);

    const orderEntries = Object.entries(option.orderBy ?? {});
    const orderBy = orderEntries.length
      ? `ORDER BY ${orderEntries
          .map(([c, dir]) => `${ident(c)} ${dir === "DESC" ? "DESC" : "ASC"}`)
          .join(", ")}`
      : "";

    const limit =
      option.limit !== undefined ? `LIMIT ${Math.max(0, Math.floor(option.limit))}` : "";
    const offset =
      option.offset !== undefined ? `OFFSET ${Math.max(0, Math.floor(option.offset))}` : "";

    const text = `SELECT ${cols} FROM ${this.table} ${where} ${orderBy} ${limit} ${offset}`;
    return this.query<TYPE>(text, params);
  }

  async findOne(option: FindOption<TYPE> = {}): Promise<TYPE | null> {
    const rows = await this.find({ ...option, limit: 1 });
    return rows[0] ?? null;
  }

  async findById(id: string | number, withDeleted = false): Promise<TYPE | null> {
    return this.findOne({
      where: { [this.PRIMARY_KEY]: id } as WhereClauseOption<TYPE>,
      withDeleted,
    });
  }

  async count(where?: WhereClauseOption<TYPE>, withDeleted = false): Promise<number> {
    const params: Params = [];
    const w = this.buildWhere(where, params, withDeleted);
    const rows = await this.query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM ${this.table} ${w}`,
      params,
    );
    return Number(rows[0]?.count ?? 0);
  }

  /* ------------------------------ CREATE ------------------------------- */

  async create(createData: Partial<TYPE>): Promise<TYPE> {
    const keys = Object.keys(createData).filter((k) => createData[k] !== undefined);
    if (keys.length === 0) {
      const rows = await this.query<TYPE>(`INSERT INTO ${this.table} DEFAULT VALUES RETURNING *`);
      return rows[0]!;
    }

    const params: Params = [];
    const cols = keys.map(ident).join(", ");
    const phs = keys.map((k) => this.bind(params, createData[k])).join(", ");

    const rows = await this.query<TYPE>(
      `INSERT INTO ${this.table} (${cols}) VALUES (${phs}) RETURNING *`,
      params,
    );
    return rows[0]!;
  }

  async insertBulk(data: Partial<TYPE>[]): Promise<TYPE[]> {
    if (data.length === 0) return [];

    // Gabungkan semua key dari seluruh baris; key yang tidak ada → DEFAULT
    const keys = [...new Set(data.flatMap((row) => Object.keys(row)))].filter((k) =>
      data.some((row) => row[k] !== undefined),
    );
    if (keys.length === 0) throw new Error("insertBulk: no columns to insert");

    // Batas Postgres: 65535 parameter per query
    const chunkSize = Math.max(1, Math.floor(65000 / keys.length));
    const cols = keys.map(ident).join(", ");
    const result: TYPE[] = [];

    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      const params: Params = [];

      const valuesSql = chunk
        .map((row) => {
          const phs = keys.map((k) =>
            row[k] === undefined ? "DEFAULT" : this.bind(params, row[k]),
          );
          return `(${phs.join(", ")})`;
        })
        .join(", ");

      const rows = await this.query<TYPE>(
        `INSERT INTO ${this.table} (${cols}) VALUES ${valuesSql} RETURNING *`,
        params,
      );
      result.push(...rows);
    }

    return result;
  }

  /* ------------------------------ UPDATE ------------------------------- */

  async update(id: string | number, update: Partial<TYPE>): Promise<TYPE | null> {
    const keys = Object.keys(update).filter((k) => update[k] !== undefined);
    if (keys.length === 0) return this.findById(id);

    const params: Params = [];
    const setSql = keys.map((k) => `${ident(k)} = ${this.bind(params, update[k])}`).join(", ");
    const where = this.buildWhere(
      { [this.PRIMARY_KEY]: id } as WhereClauseOption<TYPE>,
      params,
    );

    const rows = await this.query<TYPE>(
      `UPDATE ${this.table} SET ${setSql} ${where} RETURNING *`,
      params,
    );
    return rows[0] ?? null;
  }

  /* ------------------------------ DELETE ------------------------------- */

  async softDelete(id: string | number): Promise<boolean> {
    if (!this.SOFT_DELETE_COLUMN) {
      throw new Error(`${this.TABLE_NAME} does not support soft delete`);
    }

    const params: Params = [];
    const where = this.buildWhere(
      { [this.PRIMARY_KEY]: id } as WhereClauseOption<TYPE>,
      params,
    );

    const rows = await this.query(
      `UPDATE ${this.table} SET ${ident(this.SOFT_DELETE_COLUMN)} = NOW() ${where} RETURNING ${ident(this.PRIMARY_KEY)}`,
      params,
    );
    return rows.length > 0;
  }

  /** Kembalikan data yang sudah di-soft delete berdasarkan id. Mengembalikan baris yang dipulihkan, atau null jika tidak ditemukan / tidak sedang terhapus */
  async restore(id: string | number): Promise<TYPE | null> {
    const col = this.requireSoftDeleteColumn();

    const params: Params = [];
    const where = this.buildWhere(
      { [this.PRIMARY_KEY]: id, [col]: { $isNull: false } } as WhereClauseOption<TYPE>,
      params,
      true, // sertakan baris yang sudah terhapus
    );

    const rows = await this.query<TYPE>(
      `UPDATE ${this.table} SET ${ident(col)} = NULL ${where} RETURNING *`,
      params,
    );
    return rows[0] ?? null;
  }

  /** Pulihkan banyak baris sekaligus; mengembalikan jumlah baris yang dipulihkan */
  async restoreWhere(option: WhereClauseOption<TYPE>): Promise<number> {
    const col = this.requireSoftDeleteColumn();

    const hasCondition = Object.values(option ?? {}).some((v) => v !== undefined);
    if (!hasCondition) {
      throw new Error("restoreWhere: where condition is required (refusing to restore all rows)");
    }

    const params: Params = [];
    const where = this.buildWhere(
      { ...option, [col]: { $isNull: false } } as WhereClauseOption<TYPE>,
      params,
      true,
    );

    const rows = await this.query(
      `UPDATE ${this.table} SET ${ident(col)} = NULL ${where} RETURNING ${ident(this.PRIMARY_KEY)}`,
      params,
    );
    return rows.length;
  }

  private requireSoftDeleteColumn(): string {
    if (!this.SOFT_DELETE_COLUMN) {
      throw new Error(`${this.TABLE_NAME} does not support soft delete`);
    }
    return this.SOFT_DELETE_COLUMN;
  }

  /** Hapus permanen (hard delete) berdasarkan id */
  async remove(id: string | number): Promise<boolean> {
    const params: Params = [];
    const where = this.buildWhere(
      { [this.PRIMARY_KEY]: id } as WhereClauseOption<TYPE>,
      params,
      true,
    );

    const rows = await this.query(
      `DELETE FROM ${this.table} ${where} RETURNING ${ident(this.PRIMARY_KEY)}`,
      params,
    );
    return rows.length > 0;
  }

  /** Hapus permanen banyak baris; mengembalikan jumlah baris terhapus */
  async removeWhere(option: WhereClauseOption<TYPE>): Promise<number> {
    const hasCondition = Object.values(option ?? {}).some((v) => v !== undefined);
    if (!hasCondition) {
      throw new Error("removeWhere: where condition is required (refusing to delete all rows)");
    }

    const params: Params = [];
    const where = this.buildWhere(option, params, true);

    const rows = await this.query(
      `DELETE FROM ${this.table} ${where} RETURNING ${ident(this.PRIMARY_KEY)}`,
      params,
    );
    return rows.length;
  }
}