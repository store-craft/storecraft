import { PoolOptions } from 'mysql2';

export { MySQL } from './index.js';

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
  pool_options?: PoolOptions;
}
