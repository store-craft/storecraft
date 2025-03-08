/**
 * @import { PlanetScaleDialectConfig } from './types.public.js';
 * @import { ENV } from '@storecraft/core';
 * 
 */
import { SQL } from '@storecraft/database-sql-base';
import { PlanetScaleDialect } from './kysely.planet.dialect.js';


/**
 * @param {any} b 
 * @param {string} msg 
 */
const assert = (b, msg) => {
  if(!Boolean(b)) throw new Error(msg);
}

/** @type {ENV<PlanetScaleDialectConfig>} */
const EnvConfig = {
  url: 'PLANETSCALE_CONNECTION_URL'
}


/**
 * 
 * @extends {SQL}
 */
export class PlanetScale extends SQL {

  /**
   * 
   * @param {PlanetScaleDialectConfig} [config] config 
   */
  constructor(config) {
    super(
      {
        dialect_type: 'MYSQL',
        dialect: new PlanetScaleDialect(config),
      }
    );

  }

  /** @type {SQL["init"]} */
  init = (app) => {
    const dialect = /** @type {PlanetScaleDialect} */ (this.config.dialect);
    const config = dialect.config;

    config.url ??= app.platform.env[EnvConfig.url];
    
    super.init(app);
  }

}
