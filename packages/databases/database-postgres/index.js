import { SQL } from '@storecraft/database-sql-base';
import { PostgresDialect } from 'kysely';
import pg from 'pg';

/**
 * @description `postgres` driver for storecraft using the `pg` driver
 * 
 */
export class Postgres extends SQL {

  /**
   * 
   * @param {import('./types.public.d.ts').Config} [config] config 
   */
  constructor(config) {
    super(
      {
        dialect_type: 'POSTGRES',
        dialect: new PostgresDialect(
          {
            pool: new pg.Pool(config.pool_config),
            cursor: config.cursor
          }
        ),
      }
    );

  }

}
