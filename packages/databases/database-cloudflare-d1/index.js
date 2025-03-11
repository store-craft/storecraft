/**
 * @import { D1ConfigHTTP, D1ConfigWorker } from './types.public.js';
 * @import { ENV } from '@storecraft/core';
 * @import { D1Database } from '@cloudflare/workers-types';
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


/**
 * @extends {SQL}
 */
export class D1_HTTP extends SQL {

  /** @satisfies {ENV<D1ConfigHTTP>} */
  static EnvConfig = /** @type{const} */ ({
    account_id: 'CF_ACCOUNT_ID',
    api_token: 'D1_API_TOKEN',
    database_id: 'D1_DATABASE_ID',
    db_name: 'D1_DATABASE_NAME'
  });

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

    dialect.config.account_id ??= app.platform.env[D1_HTTP.EnvConfig.account_id];
    dialect.config.api_token ??= app.platform.env[D1_HTTP.EnvConfig.api_token] 
      ?? app.platform.env['D1_API_KEY'];
    dialect.config.database_id ??= app.platform.env[D1_HTTP.EnvConfig.database_id];
      
    super.init(app);
  }

}

/**
 * @extends {SQL}
 */
export class D1_WORKER extends SQL {

  static ENV_BINDING = /** @type{const} */ ('DB');

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

  /** @type {SQL["init"]} */
  init = (app) => {
    const dialect = (/** @type {D1_Worker_Dialect} */ (this.config.dialect));

    // We might have the db bound to `DB` at the worker `ENV`
    dialect.config.db ??= (/** @type {D1Database} */(/** @type {unknown} */ (app.platform.env[D1_WORKER.ENV_BINDING])));
      
    super.init(app);
  }

}

export class D {}
