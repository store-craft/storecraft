import { D1Database } from '@cloudflare/workers-types';

export * from './index.js'

/**
 * @description config for D1 over http
 */
export type D1ConfigHTTP = {
  /**
   * @description Cloudflare account id
   * 
   */
  account_id: string

  /**
   * @description api token, can be generated at dashboard, 
   * [instructions](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)
   * 
   */
  api_token: string

  /**
   * @description Your `D1` database ID
   */
  database_id: string;

  /**
   * @description Your `D1` database name
   */
  db_name?: string;
}

/**
 * @description config for D1 over worker runtime
 */
export type D1ConfigWorker = {
  db: D1Database;
}