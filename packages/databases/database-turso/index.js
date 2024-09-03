import { SQL } from '@storecraft/database-sql-base';
import { LibsqlDialect } from './kysely.turso.dialect.js';

/**
 * @extends {SQL}
 */
export class Turso extends SQL {

  /**
   * 
   * @param {import('./types.public.d.ts').Config} [config] config 
   */
  constructor(config) {
    super(
      {
        dialect_type: 'SQLITE',
        dialect: new LibsqlDialect(config),
      }
    );

  }

}
