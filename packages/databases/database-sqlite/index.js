import { SQL } from '@storecraft/database-sql-base';
import { SqliteDialect } from 'kysely';
import BetterSQLite from 'better-sqlite3';


/**
 * @description `better-sqlite` driver for storecraft
 * 
 */
export class SQLite extends SQL {

  /**
   * 
   * @param {import('./types.public.d.ts').Config} [config] config 
   */
  constructor(config) {
    super(
      {
        dialect_type: 'SQLITE',
        dialect: new SqliteDialect(
          {
            database: async () => new BetterSQLite(config.filename, config.options)
          }
        ),
      }
    );

  }

}
