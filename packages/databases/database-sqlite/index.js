/**
 * @import { Config } from './types.public.js';
 * @import { ENV } from '@storecraft/core';
 */
import { SQL } from '@storecraft/database-sql-base';
import { SqliteDialect } from 'kysely';
import BetterSQLite from 'better-sqlite3';



/**
 * @description `better-sqlite3` driver for `storecraft`
 */
export class SQLite extends SQL {

  /** @satisfies {ENV<Config>} */
  static EnvConfig = /** @type {const} */ (
    {
      filepath: 'SQLITE_FILEPATH',
    }
  );

  /**
   * 
   * @param {Config} [config] config 
   */
  constructor(config={ filepath: 'database.db' }) {
    super(
      {
        dialect_type: 'SQLITE',
        dialect: new SqliteDialect(
          {
            database: async () => new BetterSQLite(
              config.filepath, config.options
            )
          }
        ),
      }
    );

    // a bit hacky
    this.dialect_config = config;
  }


  /** @type {SQL["init"]} */
  init = (app) => {
    this.dialect_config.filepath ??= app.platform.env[SQLite.EnvConfig.filepath];
    super.init(app);
  }

}

