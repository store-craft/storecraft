/**
 * @import { Config } from './types.public.js';
 * @import { ENV } from '@storecraft/core';
 */

import { SQL } from '@storecraft/database-sql-base';
import { LibsqlDialect } from './kysely.turso.dialect.js';

export { LibSQLVectorStore } from './vector-store/index.js'

/**
 * @extends {SQL}
 */
export class Turso extends SQL {

  /** @satisfies {ENV<Config>} */
  static EnvConfig = /** @type{const} */ ({
    authToken: 'LIBSQL_AUTH_TOKEN',
    url: 'LIBSQL_URL'
  });
  
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
            prefers_batch_over_transactions: true,
            ...config,
          }
        ),
      }
    );
  }
  

  /** @type {SQL["init"]} */
  init = (app) => { 
    const dialect = /** @type {LibsqlDialect}*/ (this.config.dialect);
    const dconfig = dialect.config;
    
    dconfig.authToken ??= app.platform.env[Turso.EnvConfig.authToken];
    dconfig.url ??= app.platform.env[Turso.EnvConfig.url];
        
    super.init(app);
  }
}
