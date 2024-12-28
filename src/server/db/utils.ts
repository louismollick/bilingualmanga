import {
  type AnyColumn,
  type GetColumnData,
  type SQL,
  is,
  sql,
} from "drizzle-orm";
import { PgTimestampString, type SelectedFields } from "drizzle-orm/pg-core";
import { type SelectResultFields } from "drizzle-orm/query-builders/select.types";

export function coalesce<T>(value: SQL.Aliased<T> | SQL<T>, defaultValue: SQL) {
  return sql<T>`coalesce(${value}, ${defaultValue})`;
}

export function jsonAgg<Column extends AnyColumn>(column: Column) {
  return coalesce<GetColumnData<Column, "raw">[]>(
    sql`json_agg(${sql`${column}`})`,
    sql`'[]'`,
  );
}

export function jsonBuildObject<T extends SelectedFields>(shape: T) {
  const chunks: SQL[] = [];

  Object.entries(shape).forEach(([key, value]) => {
    if (chunks.length > 0) {
      chunks.push(sql.raw(`,`));
    }

    chunks.push(sql.raw(`'${key}',`));

    // json_build_object formats to ISO 8601 ...
    if (is(value, PgTimestampString)) {
      chunks.push(sql`timezone('UTC', ${value})`);
    } else {
      chunks.push(sql`${value}`);
    }
  });

  return sql<SelectResultFields<T>>`json_build_object(${sql.join(chunks)})`;
}

export function jsonAggBuildObject<T extends SelectedFields>(
  shape: T,
  options?: {
    notNull?: { colName: AnyColumn };
    orderBy?: { colName: AnyColumn; direction: "ASC" | "DESC" };
  },
) {
  return sql<SelectResultFields<T>[]>`coalesce(
    json_agg(${jsonBuildObject(shape)}
    ${
      options?.orderBy
        ? sql`ORDER BY ${options.orderBy.colName} ${sql.raw(
            options.orderBy.direction,
          )}`
        : undefined
    }) 
    ${
      options?.notNull
        ? sql`FILTER (WHERE ${options.notNull.colName} IS NOT NULL)`
        : undefined
    }
    ,'${sql`[]`}')`;
}
