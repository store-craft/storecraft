import type { Dialect } from 'kysely'

export * from './index.js'

export type SqlDialectType = 'SQLITE' | 'POSTGRES' | 'MYSQL';

/**
 * The Storecraft SQL config
 */
export type Config = {
  /**
   * The Kysely dialect
   */
  dialect: Dialect,
  /**
   * The type of the sql dialect `SQLITE`, `POSTGRES`, `MYSQL`, `MSSQL`
   */
  dialect_type: SqlDialectType;
}
