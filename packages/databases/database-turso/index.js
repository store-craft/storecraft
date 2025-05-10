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
  static EnvConfig = /** @type {const} */ ({
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
    
    // optional
    dconfig.authToken ??= app.env[Turso.EnvConfig.authToken];
    // mandatory
    dconfig.url ??= (app.env[Turso.EnvConfig.url] ?? 'file:data.db');

    if (!dconfig.url) {
      console.warn(
        'LibSQL URL is missing. Please set the LIBSQL_URL environment variable \
        or programatically in the constructor config. \
        url was set to local file `file:data.db` instead'
      );
      dconfig.url = 'file:data.db';
    }
        
    super.init(app);
  }
}


export const LibSQL = Turso;