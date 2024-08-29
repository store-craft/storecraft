import type { Config as LibSqlConfig } from '@libsql/client'
export { Turso } from './index.js';

export type Config = {

  /**
   * @description Official `libsql` config
   */
  libsqlConfig: LibSqlConfig

  /**
   * @description if `true`, transactions are converted into a non-interactive batch,
   * use with caution and prefer this when transactions are non-interactive
   */
  prefers_batch_over_transactions?: boolean;
}