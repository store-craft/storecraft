/**
 * @import { NeonServerlessConfig, NeonHttpConfig } from './types.public.js';
 * @import { ENV } from '@storecraft/core';
 * 
 */
import { SQL } from '@storecraft/database-sql-base';
import { NeonServerlessDialect } from './kysely.neon.dialect.js';
import { NeonHTTPDialect } from './kysely.neon-http.dialect.js';

/**
 * @param {any} b 
 * @param {string} msg 
 */
const assert = (b, msg) => {
  if(!Boolean(b)) throw new Error(msg);
}

/**
 * @description serverless neon, supports interactive transactions over websockets.
 * You can also try the `http` variant which supports batches here {@link NeonHttp}
 * 
 * @extends {SQL}
 */
export class NeonServerless extends SQL {

  /** @satisfies {ENV<NeonServerlessConfig>} */
  static NeonServerlessEnvConfig = /** @type {const} */ ({
    poolConfig: {
      connectionString: 'NEON_CONNECTION_URL',
    }
  });

  /**
   * 
   * @param {NeonServerlessConfig} [config] config 
   */
  constructor(config) {
    super(
      {
        dialect_type: 'POSTGRES',
        dialect: new NeonServerlessDialect(config),
      }
    );

  }

  /** @type {SQL["init"]} */
  init = (app) => {
    const neon_dialect = /** @type {NeonServerlessDialect} */ (this.config.dialect);
    const config = neon_dialect.config;

    config.poolConfig.connectionString ??= 
      app.platform.env[NeonServerless.NeonServerlessEnvConfig.poolConfig.connectionString];

    super.init(app);
  }

}

/**
 * @description serverless http only neon, supports NON-interactive 
 * transactions / batches over HTTP.
 * You can also try the interactive transaction variant which requires 
 * `web-sockets` here {@link NeonServerless}
 * 
 * 
 * @extends {SQL}
 */
export class NeonHttp extends SQL {

  /** @satisfies {ENV<NeonHttpConfig>} */
  static NeonHttpEnvConfig = /** @type{const} */ ({
    connectionString: 'NEON_CONNECTION_URL',
  });

  /**
   * 
   * @param {NeonHttpConfig} [config] config 
   */
  constructor(config) {
    super(
      {
        dialect_type: 'POSTGRES',
        dialect: new NeonHTTPDialect(config),
      }
    );

  }

  /** @type {SQL["init"]} */
  init = (app) => {
    const neon_dialect = /** @type {NeonHTTPDialect} */ (this.config.dialect);
    const config = neon_dialect.config;

    config.connectionString ??= 
      app.platform.env[NeonHttp.NeonHttpEnvConfig.connectionString];

    super.init(app);
  }

}
