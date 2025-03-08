/**
 * @import { Config } from './types.public.js';
 * @import { ENV } from '@storecraft/core';
 * 
 */
import { SQL } from '@storecraft/database-sql-base';
import { MysqlDialect } from 'kysely';
import { createPool } from 'mysql2'

/** @type {ENV<Config>} */
const EnvConfig = {
  pool_options: {
    database: 'MYSQL_DATABASE',
    host: 'MYSQL_HOST',
    port: 'MYSQL_PORT',
    user: 'MYSQL_USER',
    password: 'MYSQL_PASSWORD'
  }
}

/**
 * @description `mysql` driver for storecraft using the `mysql2` driver
 * 
 */
export class MySQL extends SQL {

  /**
   * 
   * @param {Config} [config] config 
   */
  constructor(config) {
    super(
      {
        dialect_type: 'MYSQL',
        dialect: new MysqlDialect(
          {
            pool: async () => createPool(config.pool_options),
          }
        ),
      }
    );

    this.mysql_config = config
  }

  /** @type {SQL["init"]} */
  init = (app) => {
    this.mysql_config.pool_options.database ??= 
      app.platform.env[EnvConfig.pool_options.database];

    this.mysql_config.pool_options.host ??= 
      app.platform.env[EnvConfig.pool_options.host];

    this.mysql_config.pool_options.port ??= 
      parseFloat(app.platform.env[EnvConfig.pool_options.port]);

    this.mysql_config.pool_options.user ??= 
      app.platform.env[EnvConfig.pool_options.user];

    this.mysql_config.pool_options.password ??= 
      app.platform.env[EnvConfig.pool_options.password];

    super.init(app);
  }

}
