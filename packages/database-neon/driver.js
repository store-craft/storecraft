import { SQL } from '@storecraft/database-sql-base';
import { NeonServerlessDialect } from './kysely.neon.dialect.js';
import { NeonHTTPDialect } from './kysely.neon-http.dialect.js';

/**
 * @param {any} b 
 * @param {string} msg 
 */
const assert = (b, msg) => {
  if(!Boolean(b)) throw new Error(msg);
}


/**
 * @description serverless neon, supports interactive transactions over websockets.
 * You can also try the `http` variant which supports batches here {@link NeonHttp}
 * 
 * @extends {SQL}
 */
export class NeonServerless extends SQL {

  /**
   * 
   * @param {import('./types.public.js').NeonServerlessConfig} [config] config 
   */
  constructor(config) {
    super(
      {
        dialect_type: 'POSTGRES',
        dialect: new NeonServerlessDialect(config),
      }
    );

  }

}


/**
 * @description serverless http only neon, supports NON-interactive 
 * transactions / batches over HTTP.
 * You can also try the interactive transaction variant which requires 
 * `web-sockets` here {@link NeonServerless}
 * 
 * 
 * @extends {SQL}
 */
export class NeonHttp extends SQL {

  /**
   * 
   * @param {import('./types.public.js').NeonHttpConfig} [config] config 
   */
  constructor(config) {
    super(
      {
        dialect_type: 'POSTGRES',
        dialect: new NeonHTTPDialect(config),
      }
    );

  }

}
