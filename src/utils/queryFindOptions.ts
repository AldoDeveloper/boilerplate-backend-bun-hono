import { sql } from "@/config/database";
import { IFindOption } from "@/types";

export interface IFindOptionData extends IFindOption {}

export interface IQueryFindOption {
  tableName: string;
  select: Array<string>;
  option: IFindOptionData & {
    searchColumns?: Array<string>;
  };
}

// Escape identifier Postgres: "name" (mendukung schema.table)
const quoteIdent = (name: string) =>
  name
    .split(".")
    .map((part) => `"${part.replace(/"/g, '""')}"`)
    .join(".");

export async function queryFindOption({ tableName, select, option }: IQueryFindOption) {
  const params: unknown[] = [];

  const selectClause =
    select.length > 0 ? select.map(quoteIdent).join(", ") : "*";

  let whereClause = "WHERE 1=1";

  if (option.search && option.searchColumns && option.searchColumns.length > 0) {
    params.push(`%${option.search}%`);
    const placeholder = `$${params.length}`;

    const conditions = option.searchColumns
      .map((col) => `${quoteIdent(col)}::text ILIKE ${placeholder}`)
      .join(" OR ");

    whereClause += ` AND (${conditions})`;
  }

  let paginationClause = "";

  if (option.limit && option.limit > 0) {
    params.push(option.limit);
    paginationClause += ` LIMIT $${params.length}`;

    if (option.page && option.page > 0) {
      params.push((option.page - 1) * option.limit);
      paginationClause += ` OFFSET $${params.length}`;
    }
  }

  const text = `
    SELECT ${selectClause}
    FROM ${quoteIdent(tableName)}
    ${whereClause}
    ${paginationClause}
  `;

  return await sql.unsafe(text, params);
}
