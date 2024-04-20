import { App } from '@storecraft/core';
import { Collection, MongoClient, ServerApiVersion } from 'mongodb';
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
 * @typedef {Partial<import('./types.public.js').Config>} Config
 */

/**
 * 
 * @param {string} uri 
 * @param {import('mongodb').MongoClientOptions} [options] 
 */
const connect = async (uri, options) => {

  options = options ?? {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  }
  const client = new MongoClient(uri, options);

  return client.connect();
}

/**
 * @typedef {import('@storecraft/core/v-database').db_driver} db_driver
 * @implements {db_driver}
 */
export class MongoDB {

  /** @type {boolean} */ 
  #_is_ready;

  /** @type {App<any, any, any>} */ 
  #_app;

  /** @type {MongoClient} */ 
  #_mongo_client;

  /** @type {Config} */ 
  #_config;

  // /** @type {db_driver["resources"]} */
  // #_resources;

  /**
   * 
   * @param {Config} [config] config, if undefined, 
   * env variables `MONGODB_URL` will be used for uri upon init later
   */
  constructor(config) {
    this.#_is_ready = false;
    this.#_config = config;
  }

  /**
   * 
   * @param {App<any, any, any>} app 
   * 
   * 
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

    this.#_mongo_client = await connect(
      this.config.url,
      this.config.options
    );

    this.#_app = app;

    this.resources = {
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
      shipping: shipping(this),
    }
    
    this.#_is_ready = true; 

    return this;
  }

  async migrateToLatest() {
    this.throwIfNotReady();
    const { migrateToLatest } = await import('./migrate.js');
    await migrateToLatest(this);
  }

  async disconnect() {
    await this.mongo_client.close(true);
    return true;
  }

  get isReady() { return this.#_is_ready; }

  throwIfNotReady() {
    if(!this.isReady)
      throw new Error('Database not ready !!! you need to `.init()` it')
  }

  /**
   * database name
   */
  get name () {
    return this.config.db_name ?? 'main';
  }

  /**
   * Get the `storecraft` app
   */
  get app() { 
    return this.#_app; 
  }

  /**
   * Get the native `mongodb` client
   */
  get mongo_client() {
    return this.#_mongo_client;
  }

  /**
   * Get the config object
   */
  get config() { 
    return this.#_config; 
  }

  /**
   * 
   * @template {import('@storecraft/core/v-api').BaseType} T
   * 
   * 
   * @param {string} name 
   * 
   * 
   * @returns {Collection<T>}
   */
  collection(name) {
    return this.mongo_client.db(this.name).collection(name);
  }

}
