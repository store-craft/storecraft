import type { Config as LibSqlConfig } from '@libsql/client'
export * from './index.js';

export type Config = Partial<Omit<LibSqlConfig, 'url' | 'authToken'>> & {

  /** The database URL.
   *
   * The client supports `libsql:`, `http:`/`https:`, `ws:`/`wss:` and `file:` URL. For more infomation,
   * please refer to the project README:
   *
   * https://github.com/libsql/libsql-client-ts#supported-urls
   * 
   * If missing, it will be inferred by env variable `LIBSQL_URL` or
   * will settle to `file:data.db` if `LIBSQL_URL` is not set.
   */
  url?: string;
  /** 
   * Authentication token for the database. Not applicable for `url`=`file:local.db`.
   * 
   * If missing, it will be inferred by env variable `LIBSQL_AUTH_TOKEN`
   */
  authToken?: string;

  /**
   * @description if `true`, transactions are converted into a non-interactive batch,
   * use with caution and prefer this when transactions are non-interactive
   * @default true
   */
  prefers_batch_over_transactions?: boolean;
}