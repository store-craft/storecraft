/**
 * @import { Config } from './types.public.js';
 */

import { SQL } from '@storecraft/database-sql-base';
import { LibsqlDialect } from './kysely.turso.dialect.js';

export const ENV_LIBSQL_AUTH_TOKEN = 'LIBSQL_AUTH_TOKEN';
export const ENV_LIBSQL_URL = 'LIBSQL_URL';

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
    
    dconfig.authToken = dconfig.authToken ?? app.platform.env[ENV_LIBSQL_AUTH_TOKEN];
    dconfig.url = dconfig.url ?? app.platform.env[ENV_LIBSQL_URL];
        
    super.init(app);
  }
}
