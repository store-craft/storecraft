import { SQL } from '@storecraft/database-sql-base';
import { PlanetScaleDialect } from './kysely.planet.dialect.js';


/**
 * @param {any} b 
 * @param {string} msg 
 */
const assert = (b, msg) => {
  if(!Boolean(b)) throw new Error(msg);
}


/**
 * 
 * @extends {SQL}
 */
export class PlanetScale extends SQL {

  /**
   * 
   * @param {import('./types.public.d.ts').PlanetScaleDialectConfig} [config] config 
   */
  constructor(config) {
    super(
      {
        dialect_type: 'MYSQL',
        dialect: new PlanetScaleDialect(config),
      }
    );

  }

}
