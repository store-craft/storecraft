/**
 * @import { Config } from './types.public.js';
 * @import { ENV } from '@storecraft/core';
 * 
 */
import { SQL } from '@storecraft/database-sql-base';
import { PostgresDialect } from 'kysely';
import pg from 'pg';


/**
 * @description `postgres` driver for storecraft using the `pg` driver
 * 
 */
export class Postgres extends SQL {

  /** @satisfies {ENV<Config>} */
  static EnvConfig = /** @type{const} */ ({
    pool_config: {
      host: 'POSTGRES_HOST',
      port: 'POSTGRES_PORT',
      user: 'POSTGRES_USER',
      password: 'POSTGRES_PASSWORD',
    }
  });

  /**
   * 
   * @param {Config} [config] config 
   */
  constructor(config) {
    super(
      {
        dialect_type: 'POSTGRES',
        dialect: new PostgresDialect(
          {
            pool: async () => new pg.Pool(config.pool_config),
            cursor: config.cursor
          }
        ),
      }
    );

    // abit hacky :0
    this.pg_config = config;
  }

  /** @type {SQL["init"]} */
  init = (app) => {
    this.pg_config.pool_config.host ??= 
      app.platform.env[Postgres.EnvConfig.pool_config.host];

    this.pg_config.pool_config.port ??= 
      parseFloat(app.platform.env[Postgres.EnvConfig.pool_config.port]);

    this.pg_config.pool_config.user ??= 
      app.platform.env[Postgres.EnvConfig.pool_config.user];

    this.pg_config.pool_config.password ??= 
      app.platform.env[Postgres.EnvConfig.pool_config.password];
      
    super.init(app);
    }

}
