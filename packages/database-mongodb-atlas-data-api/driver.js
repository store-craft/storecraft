import { App } from '@storecraft/core';
import { Collection, MongoDBDataAPIClient as MongoClient } from './data-api-client/index.js'
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

/**
 * @typedef {import('./types.public.js').Config} Config
 */


/**
 * @typedef {import('@storecraft/core/v-database').db_driver} db_driver
 * @implements {db_driver}
 */
export class MongoDB {

  /** @type {boolean} */ #_is_ready;
  /** @type {App<any, any, any>} */ #_app;
  /** @type {MongoClient} */ #_mongo_client;
  /** @type {Partial<Config>} */ #_config;

  /**
   * 
   * @param {Partial<Config>} [config] config, if undefined, 
   * env variables, taht will be infered upon init are
   * - `MONGODB_DATA_API_KEY`
   * - `MONGODB_DATA_API_DATA_SOURCE`
   * - `MONGODB_DATA_API_ENDPOINT`
   * - `MONGODB_NAME`
   */
  constructor(config) {
    this.#_is_ready = false;
    this.#_config = config;
  }

  /**
   * 
   * @param {App<any, any, any>} app 
   * @returns {Promise<this>}
   */
  async init(app) {
    if(this.isReady)
      return this;
    this.#_config = {
      ...this.#_config, 
      apiKey: this.#_config?.apiKey ?? app.platform.env.MONGODB_DATA_API_KEY,
      dataSource: this.#_config?.dataSource ?? app.platform.env.MONGODB_DATA_API_DATA_SOURCE,
      endpoint: this.#_config?.endpoint ?? app.platform.env.MONGODB_DATA_API_ENDPOINT,
      db_name: this.#_config?.db_name ?? app.platform.env.MONGODB_NAME ?? 'main',
    }

    this.#_mongo_client = new MongoClient(this.#_config);

    this.#_app = app;
    this.auth_users = auth_users(this);
    this.collections = collections(this);
    this.customers = customers(this);
    this.discounts = discounts(this);
    this.images = images(this);
    this.notifications = notifications(this);
    this.orders = orders(this);
    this.posts = posts(this);
    this.products = products(this);
    this.storefronts = storefronts(this);
    this.tags = tags(this);
    this.shipping = shipping(this);
    
    this.#_is_ready = true; 

    return this;
  }

  async disconnect() {
    return true;
  }

  get isReady() { return this.#_is_ready; }
  
  /**
   * database name
   */
  get name () {
    return this.config.db_name ?? 'main';
  }

  get app() { return this.#_app; }

  get mongo_client() {
    return this.#_mongo_client;
  }

  get config() { return this.#_config; }

  /**
   * @template {import('@storecraft/core/v-api').BaseType} T
   * @param {string} name 
   * @returns {Collection<T>}
   */
  collection(name) {
    return this.mongo_client.db(this.name).collection(name);
  }

}
