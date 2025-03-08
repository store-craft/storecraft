/**
 * @import { Config } from './types.public.js';
 * @import { ENV } from '@storecraft/core';
 */

import { SQL } from '@storecraft/database-sql-base';
import { LibsqlDialect } from './kysely.turso.dialect.js';

export { LibSQLVectorStore } from './vector-store/index.js'

/** @type {ENV<Config>} */
const EnvConfig = {
  authToken: 'LIBSQL_AUTH_TOKEN',
  url: 'LIBSQL_URL'
}


/**
 * @extends {SQL}
 */
export class Turso extends SQL {

  /**
   * 
   * @param {Config} [config] config 
   */
  constructor(config={}) {
    super(
      {
        dialect_type: 'SQLITE',
        dialect: new LibsqlDialect(
          {
            ...config,
            prefers_batch_over_transactions: config.prefers_batch_over_transactions ?? true
          }
        ),
      }
    );
  }
  

  /** @type {SQL["init"]} */
  init = (app) => { 
    const dialect = /** @type {LibsqlDialect}*/ (this.config.dialect);
    const dconfig = dialect.config;
    
    dconfig.authToken ??= app.platform.env[EnvConfig.authToken];
    dconfig.url ??= app.platform.env[EnvConfig.url];
        
    super.init(app);
  }
}
