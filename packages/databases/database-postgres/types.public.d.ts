import { PostgresCursorConstructor } from 'kysely';
import { PoolConfig } from 'pg';

export { Postgres } from './index.js';

/**
 * @description The `postgres` config
 */
export type Config = {

  /**
   * @description A postgres Pool instance or a function that returns one.
   *
   * If a function is provided, it's called once when the first query is executed.
   *
   * https://node-postgres.com/apis/pool
   */
  pool_config: PoolConfig;
  
  /**
   * @description https://github.com/brianc/node-postgres/tree/master/packages/pg-cursor
   * ```ts
   * import Cursor from 'pg-cursor'
   * // or
   * import * as Cursor from 'pg-cursor'
   *
   * new PostgresDialect({
   *  cursor: Cursor
   * })
   * ```
   */
  cursor?: PostgresCursorConstructor;  
}
