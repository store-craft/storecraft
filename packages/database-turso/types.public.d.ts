import type { Config as LibSqlConfig } from '@libsql/client'
export { Turso } from './index.js';

export type Config = {

  /**
   * @description Official `libsql` config
   */
  libsqlConfig: LibSqlConfig

  prefers_batch_over_transactions?: boolean;
}