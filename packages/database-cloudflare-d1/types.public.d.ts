export * from './index.js'

export type Config = {
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