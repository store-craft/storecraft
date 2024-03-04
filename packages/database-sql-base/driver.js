import { App } from '@storecraft/core';
import { impl as auth_users } from './src/con.auth_users.js';
import { impl as collections } from './src/con.collections.js';
import { impl as customers } from './src/con.customers.js';
// import { impl as discounts } from './src/con.discounts.js';
// import { impl as images } from './src/con.images.js';
// import { impl as notifications } from './src/con.notifications.js';
import { impl as orders } from './src/con.orders.js';
import { impl as posts } from './src/con.posts.js';
import { impl as products } from './src/con.products.js';
import { impl as shipping } from './src/con.shipping.js';
import { impl as storefronts } from './src/con.storefronts.js';
import { impl as tags } from './src/con.tags.js';
import { Kysely, ParseJSONResultsPlugin } from 'kysely'
import { def_dialect } from './tests/dialect.js';

/**
 * @typedef {Partial<import('./types.public.js').Config>} Config
 * @typedef {import('./types.sql.tables.js').Database} Database
 * @typedef {import('kysely').Dialect} Dialect
 * @typedef {import('@storecraft/core').db_driver} db_driver
*/

/**
 * 
 * @param {string} uri 
 * @param {import('mongodb').MongoClientOptions} [options] 
 */
const connect = async (uri, options) => {
  
}

/**
 * @template {Dialect} D
 * @implements {db_driver}
 */
export class SQL {

  /** @type {boolean} */ #_is_ready;
  /** @type {App<any, any, any>} */ #_app;
  /** @type {Config} */ #_config;
  /** @type {D} */ #_dialect;
  /** @type {Kysely<Database>} */ #_client;

  /**
   * 
   * @param {Config} [config] config, if undefined, 
   * @param {D} [dialect] config, if undefined, 
   * env variables `MONGODB_URL` will be used for uri upon init later
   */
  constructor(config, dialect) {
    this.#_is_ready = false;
    this.#_config = config;

    if(!dialect) {
      dialect = def_dialect;
    }

    this.#_dialect = dialect;
    this.#_client = new Kysely({
      dialect, 
      plugins: [
        new ParseJSONResultsPlugin()
      ]
    });
  }

  /**
   * 
   * @param {App<any, any, any>} app 
   * @returns {Promise<this>}
   */
  async init(app) {
    if(this.isReady)
      return this;
    const c = this.#_config;
    this.#_config = {
      ...c, 
      url: c?.url ?? app.platform.env.MONGODB_URL,
      db_name: c?.db_name ?? app.platform.env.MONGODB_NAME ?? 'main'
    }

    this.#_app = app;
    this.auth_users = auth_users(this);
    this.tags = tags(this);
    this.collections = collections(this);
    this.customers = customers(this);
    // this.discounts = discounts(this);
    // this.images = images(this);
    // this.notifications = notifications(this);
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

  get name () { return this.config.db_name ?? 'main'; }
  get app() { return this.#_app; }
  get client() { return this.#_client; }
  get config() { return this.#_config; }
  get isReady() { return this.#_is_ready; }

  /**
   * @template {import('@storecraft/core').BaseType} T
   * @param {string} name 
   */
  collection(name) {
  }

}
