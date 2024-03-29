import { App } from '@storecraft/core';
import { impl as auth_users } from './src/con.auth_users.js';
import { impl as collections } from './src/con.collections.js';
import { impl as customers } from './src/con.customers.js';
import { impl as discounts } from './src/con.discounts.js';
import { impl as images } from './src/con.images.js';
import { impl as notifications } from './src/con.notifications.js';
import { impl as orders } from './src/con.orders.js';
import { impl as posts } from './src/con.posts.js';
import { impl as products } from './src/con.products.js';
import { impl as shipping } from './src/con.shipping.js';
import { impl as storefronts } from './src/con.storefronts.js';
import { impl as tags } from './src/con.tags.js';
import { Kysely, ParseJSONResultsPlugin } from 'kysely'

/**
 * @param {any} b 
 * @param {string} msg 
 */
const assert = (b, msg) => {
  if(!Boolean(b)) throw new Error(msg);
}

/**
 * @typedef {import('./types.public.js').Config} Config
 * @typedef {import('./types.sql.tables.js').Database} Database
 * @typedef {import('kysely').Dialect} Dialect
 * @typedef {import('@storecraft/core/v-database').db_driver} db_driver
*/

/**
 * @implements {db_driver}
 */
export class SQL {

  /** @type {boolean} */ #_is_ready;
  /** @type {App<any, any, any>} */ #_app;
  /** @type {Config} */ #_config;
  /** @type {Kysely<Database>} */ #_client;

  /**
   * 
   * @param {Config} [config] config, if undefined, 
   */
  constructor(config) {
    this.#_is_ready = false;
    this.#_config = config;

    assert(this.#_config.dialect, 'No Dialect found !')
    assert(this.#_config.dialect_type, 'No Dialect Type specified !')

    this.#_client = new Kysely({
      dialect: this.#_config.dialect, 
      plugins: [
        new ParseJSONResultsPlugin()
      ]
    });
  }

  throwIfNotReady() {
    assert(
      this.isReady,
      'Database not ready !!! you need to `.init()` it'
      );
  }

  async migrateToLatest() {
    this.throwIfNotReady();
    const { migrateToLatest } = await import('./migrate.js');
    await migrateToLatest(this, false);
  };

  /**
   * 
   * @param {App<any, any, any>} app 
   * @returns {Promise<this>}
   */
  async init(app) {
    if(this.isReady)
      return this;

    this.#_app = app;
    this.auth_users = auth_users(this);
    this.tags = tags(this);
    this.collections = collections(this);
    this.customers = customers(this);
    this.discounts = discounts(this);
    this.images = images(this);
    this.notifications = notifications(this);
    this.orders = orders(this);
    this.posts = posts(this);
    this.products = products(this);
    this.storefronts = storefronts(this);
    this.shipping = shipping(this);
    
    this.#_is_ready = true; 

    return this;
  }

  async disconnect() {
    await this.client.destroy();
    return true;
  }

  get name () { 
    return 'main'; 
  }

  get app() { 
    return this.#_app; 
  }

  get client() { 
    return this.#_client; 
  }

  get config() { 
    return this.#_config; 
  }

  get isReady() { 
    return this.#_is_ready; 
  }

  get dialectType() { 
    return this.#_config.dialect_type; 
  }

  get isSqlite() { 
    return this.dialectType==='SQLITE'; 
  }

  get isPostgres() { 
    return this.dialectType==='POSTGRES'; 
  }

  get isMysql() { 
    return this.dialectType==='MYSQL'; 
  }

  get isMssql() { 
    return this.dialectType==='MSSQL'; 
  }

}
