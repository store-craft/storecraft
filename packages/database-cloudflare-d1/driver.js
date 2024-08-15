import { SQL } from '@storecraft/database-sql-base';
import { D1_HTTP_Dialect } from './kysely.d1.http.dialect.js';
import { D1_Worker_Dialect } from './kysely.d1.worker.dialect.js';

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
export class D1_HTTP extends SQL {

  /**
   * 
   * @param {import('./types.public.js').D1ConfigHTTP} [config] config 
   */
  constructor(config) {
    super(
      {
        dialect_type: 'SQLITE',
        dialect: new D1_HTTP_Dialect(config),
        db_name: config.db_name ?? 'unknown'
      }
    );

  }

}

/**
 * @extends {SQL}
 */
export class D1_WORKER extends SQL {

  /**
   * 
   * @param {import('./types.public.js').D1ConfigWorker} [config] config 
   */
  constructor(config) {
    super(
      {
        dialect_type: 'SQLITE',
        dialect: new D1_Worker_Dialect(config),
        db_name: 'unknown'
      }
    );

  }

}

export class D {}
