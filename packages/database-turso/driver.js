import { App } from '@storecraft/core';
import { SQL } from '@storecraft/database-sql-base';
import { LibsqlDialect } from './kysely.turso.dialect.js';

/**
 * @param {any} b 
 * @param {string} msg 
 */
const assert = (b, msg) => {
  if(!Boolean(b)) throw new Error(msg);
}


/**
 * @extends {SQL}
 */
export class Turso extends SQL {

  /**
   * 
   * @param {import('./types.public.js').Config} [config] config 
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
