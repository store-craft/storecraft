/**
 * @import { db_driver } from '@storecraft/core/database'
 * @import { Database } from './types.sql.tables.js'
 * @import { Config } from './types.public.js'
 * @import { Dialect } from 'kysely'
 */

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
import { impl as chats } from './src/con.chats.js';
import { impl as templates } from './src/con.templates.js';
import { impl as search } from './src/con.search.js';
import { Kysely, ParseJSONResultsPlugin } from 'kysely'
import { SanitizePlugin } from './src/kysely.sanitize.plugin.js';


/**
 * @param {any} b 
 * @param {string} msg 
 */
const assert = (b, msg) => {
  if(!Boolean(b)) throw new Error(msg);
}


/**
 * @template {Config} [ConfigType=Config]
 * @implements {db_driver<ConfigType>}
 */
export class SQL {

  /** @type {boolean} */ 
  #is_ready;

  /** @type {App<any, any, any>} */ 
  #app;

  /** @type {ConfigType} */ 
  #config;

  /** @type {Kysely<Database>} */ 
  #client;
  
  /** @type {db_driver["resources"]} */ 
  #resources;

  /**
   * 
   * @param {ConfigType} [config] config 
   */
  constructor(config) {
    this.#is_ready = false;
    this.#config = config;

    assert(
      this.#config.dialect, 
      'No Dialect found !'
    );

    assert(
      this.#config.dialect_type, 
      'No Dialect Type specified !'
    );
  }

  throwIfNotReady() {
    assert(
      this.isReady,
      'Database not ready !!! you need to `.init()` it'
    );
  }

  /**
   * @type {db_driver["init"]}
   */
  init(app) {
    if(this.isReady)
      return this;

    this.#app = app;
    
    this.#resources = {
      auth_users: auth_users(this),
      collections: collections(this),
      customers: customers(this),
      discounts: discounts(this),
      images: images(this),
      notifications: notifications(this),
      orders: orders(this),
      posts: posts(this),
      products: products(this),
      storefronts: storefronts(this),
      tags: tags(this),
      chats: chats(this),
      shipping_methods: shipping(this),
      templates: templates(this),
      search: search(this),
    }
    
    this.#is_ready = true; 

    return this;
  }

  async disconnect() {
    await this.client.destroy();
    return true;
  }

  /**
   * `database` resources
   * @type {db_driver["resources"]}
   */
  get resources () {
    return this.#resources;
  }
  
  get name() { 
    return this?.config?.db_name ?? 'main'; 
  }

  get app() { 
    return this.#app; 
  }

  get client() { 
    this.#client = this.#client ?? new Kysely(
      {
        dialect: this.config.dialect, 
        plugins: [
          new ParseJSONResultsPlugin(),
          new SanitizePlugin()
        ]
      }
    );

    return this.#client; 
  }

  get config() { 
    return this.#config; 
  }

  get isReady() { 
    return this.#is_ready; 
  }

  get dialectType() { 
    return this.#config.dialect_type; 
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

}
