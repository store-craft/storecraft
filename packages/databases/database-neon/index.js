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

/** @type {ENV<NeonServerlessConfig>} */
const NeonServerlessEnvConfig = {
  poolConfig: {
    database: 'NEON_DATABASE',
    host: 'NEON_HOST',
    port: 'NEON_PORT',
    user: 'NEON_USER',
    password: 'NEON_PASSWORD'
  }
}

/**
 * @description serverless neon, supports interactive transactions over websockets.
 * You can also try the `http` variant which supports batches here {@link NeonHttp}
 * 
 * @extends {SQL}
 */
export class NeonServerless extends SQL {

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

    config.poolConfig.database ??= 
      app.platform.env[NeonServerlessEnvConfig.poolConfig.database];

    config.poolConfig.host ??= 
      app.platform.env[NeonServerlessEnvConfig.poolConfig.host];

    config.poolConfig.port ??= 
      parseFloat(app.platform.env[NeonServerlessEnvConfig.poolConfig.port]);

    config.poolConfig.user ??= 
      app.platform.env[NeonServerlessEnvConfig.poolConfig.user];

    config.poolConfig.password ??= 
      app.platform.env[NeonServerlessEnvConfig.poolConfig.password];

    super.init(app);
  }

}

/** @type {ENV<NeonHttpConfig>} */
const NeonHttpEnvConfig = {
  connectionString: 'NEON_CONNECTION_URL'
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
      app.platform.env[NeonHttpEnvConfig.connectionString];

    super.init(app);
  }

}
