import { D1Database } from '@cloudflare/workers-types';

export { D1_HTTP, D1_WORKER } from './index.js';

/**
 * @description config for D1 over http
 */
export type D1ConfigHTTP = {
  /**
   * @description Cloudflare account id. 
   * 
   * If missing, will be inferred by env variable `CF_ACCOUNT_ID`
   */
  account_id?: string

  /**
   * @description api token, can be generated at dashboard, 
   * [instructions](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)
   * 
   * If missing, will be inferred by env variable `D1_API_KEY` or `D1_API_TOKEN`
   */
  api_token?: string

  /**
   * @description Your `D1` database ID/
   * 
   * If missing, will be inferred by env variable `D1_DATABASE_ID`
   */
  database_id?: string;

  /**
   * @description Your `D1` database name
   */
  db_name?: string;
}

/**
 * @description config for D1 over worker runtime
 */
export type D1ConfigWorker = {
  /**
   * @description The Cloudflare D1 Database binding.
   * If missing, it will be inferred by CF `ENV.DB` binding after
   * init by `storecraft`
   */
  db?: D1Database;
}