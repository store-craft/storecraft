/**
 * @import { D1ConfigHTTP, D1ConfigWorker } from './types.public.js';
 * @import { ENV } from '@storecraft/core';
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

/** @type {ENV<D1ConfigHTTP>} */
const EnvConfig = {
  account_id: 'CF_ACCOUNT_ID',
  api_token: 'D1_API_TOKEN',
  database_id: 'D1_DATABASE_ID',
}


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

    dialect.config.account_id = dialect.config.account_id 
      ?? app.platform.env[EnvConfig.account_id];

    dialect.config.api_token = dialect.config.api_token 
      ?? app.platform.env[EnvConfig.api_token] 
      ?? app.platform.env['D1_API_KEY'];

    dialect.config.database_id = dialect.config.database_id 
      ?? app.platform.env[EnvConfig.database_id];
      
    super.init(app);
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
