import { SQL } from '@storecraft/database-sql-base';
import { MysqlDialect } from 'kysely';
import { createPool } from 'mysql2'

/**
 * @description `mysql` driver for storecraft using the `mysql2` driver
 * 
 */
export class MySQL extends SQL {

  /**
   * 
   * @param {import('./types.public.d.ts').Config} [config] config 
   */
  constructor(config) {
    super(
      {
        dialect_type: 'MYSQL',
        dialect: new MysqlDialect(
          {
            pool: createPool(config.pool_options),
          }
        ),
      }
    );

  }

}
