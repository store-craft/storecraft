import type { Dialect } from 'kysely'

export * from './index.js'

export type SqlDialectType = 'SQLITE' | 'POSTGRES' | 'MYSQL';

/**
 * The Storecraft SQL config
 */
export type Config = {
  /**
   * @description Database name
   * 
   * @default main
   */
  db_name?: string,

  /**
   * @description The `Kysely` dialect
   */
  dialect: Dialect,

  /**
   * @description The type of the sql dialect `SQLITE`, `POSTGRES`, `MYSQL`
   */
  dialect_type: SqlDialectType;
}
