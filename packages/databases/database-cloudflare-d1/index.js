/**
 * @import { D1ConfigHTTP, D1ConfigWorker } from './types.public.js';
 */

import { SQL } from '@storecraft/database-sql-base';
import { D1_HTTP_Dialect } from './kysely.d1.http.dialect.js';
import { D1_Worker_Dialect } from './kysely.d1.worker.dialect.js';

/**
 * @param {any} b 
 * @param {string} msg 
 */
const assert = (b, msg) => {
  if(!Boolean(b)) throw new Error(msg);
}

export const ENV_CF_ACCOUNT_ID = 'CF_ACCOUNT_ID';
export const ENV_D1_API_KEY = 'D1_API_KEY';
export const ENV_D1_API_TOKEN = 'D1_API_TOKEN';
export const ENV_D1_DATABASE_ID = 'D1_DATABASE_ID';

/**
 * @extends {SQL}
 */
export class D1_HTTP extends SQL {

  /**
   * 
   * @param {D1ConfigHTTP} [config] config 
   */
  constructor(config) {
    super(
      {
        dialect_type: 'SQLITE',
        dialect: new D1_HTTP_Dialect(config),
        db_name: config.db_name ?? 'unknown'
      }
    );
  }

  /** @type {SQL["init"]} */
  init = (app) => {
    const dialect = (/** @type {D1_HTTP_Dialect} */ (this.config.dialect));

    dialect.config.account_id = dialect.config.account_id ?? app.platform.env[ENV_CF_ACCOUNT_ID];
    dialect.config.api_token = dialect.config.api_token ?? app.platform.env[ENV_D1_API_KEY] 
        ?? app.platform.env[ENV_D1_API_TOKEN];
    dialect.config.database_id = dialect.config.database_id ?? app.platform.env[ENV_D1_DATABASE_ID];
  }

}

/**
 * @extends {SQL}
 */
export class D1_WORKER extends SQL {

  /**
   * 
   * @param {D1ConfigWorker} [config] config 
   */
  constructor(config) {
    super(
      {
        dialect_type: 'SQLITE',
        dialect: new D1_Worker_Dialect(config),
        db_name: 'unknown'
      }
    );

  }

}

export class D {}
