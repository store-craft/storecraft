/**
 * @import { Config } from './types.public.js';
 * @import { Config as SQL_BASE_CONFIG } from '@storecraft/database-sql-base';
 */

import { SQL } from '@storecraft/database-sql-base';
import { LibsqlDialect } from './kysely.turso.dialect.js';

export const ENV_LIBSQL_AUTH_TOKEN = 'LIBSQL_AUTH_TOKEN';
export const ENV_LIBSQL_URL = 'LIBSQL_URL';

/**
 * @extends {SQL<SQL_BASE_CONFIG<LibsqlDialect>>}
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
    this.config.dialect.config.authToken = this.config.dialect.config.authToken 
        ?? app.platform.env[ENV_LIBSQL_AUTH_TOKEN];

    this.config.dialect.config.url = this.config.dialect.config.url 
        ?? app.platform.env[ENV_LIBSQL_URL];
        
    super.init(app);
  }
}
