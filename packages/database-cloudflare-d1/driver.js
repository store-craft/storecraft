import { App } from '@storecraft/core';
import { SQL } from '@storecraft/database-sql-base';
import { D1Dialect } from './kysely.d1.dialect.js';

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
export class D1 extends SQL {

  /**
   * 
   * @param {import('./types.public.js').Config} [config] config 
   */
  constructor(config) {
    super(
      {
        dialect_type: 'SQLITE',
        dialect: new D1Dialect(config),
        db_name: config.db_name ?? 'unknown'
      }
    );

  }

}
