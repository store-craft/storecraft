/**
 * @import { Config } from './types.public.js'
 * @import { MongoClientOptions } from 'mongodb'
 * @import { db_driver } from '@storecraft/core/database'
 * @import { BaseType } from '@storecraft/core/api'
 * @import { ENV } from '@storecraft/core'
 */
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
import { impl as templates } from './src/con.templates.js';
import { impl as search } from './src/con.search.js';
export { migrateToLatest } from './migrate.js';
export { MongoVectorStore } from './vector-store/index.js';

/** @type {ENV<Config>} */
const EnvConfig = {
  db_name: 'MONGODB_NAME',
  url: 'MONGODB_URL',
}


/**
 * @implements {db_driver}
 */
export class MongoDB {

  /** 
   * 
   * @type {boolean} 
   */ 
  #is_ready;

  /** 
   * 
   * @type {App<any, any, any>} 
   */ 
  #app;

  /** 
   * 
   * @type {MongoClient} 
   */ 
  #mongo_client;

  /** 
   * 
   * @type {Config} 
   */ 
  #config;

  /**
   * 
   * @param {Config} [config] config, if undefined, 
   * env variables `MONGODB_URL` will be used for uri upon init later
   */
  constructor(config) {
    this.#is_ready = false;
    this.#config = {
      options: {
        ignoreUndefined: true,
        serverApi: {
          version: ServerApiVersion.v1,
          strict: false,
          deprecationErrors: true,
        }
      },
      ...config
    };
  }

  /**
   * @type {db_driver["init"]}
   */
  init(app) {
    if(this.isReady)
      return this;
    const c = this.#config;
    c.db_name ??= app.platform.env[EnvConfig.db_name];
    c.url ??= app.platform.env[EnvConfig.url] ?? 'main';

    if(!this.config.db_name || !this.config.url) {
      throw new Error('MongoVectorStore::client() - missing url or db_name');
    }
    
    this.#app = app;
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
      shipping_methods: shipping(this),
      templates: templates(this),
      search: search(this),
    }
    
    this.#is_ready = true; 

    return this;
  }

  async disconnect() {
    await this.mongo_client.close(true);
    return true;
  }

  get isReady() { return this.#is_ready; }

  throwIfNotReady() {
    if(!this.isReady)
      throw new Error('Database not ready !!! you need to `.init()` it')
  }

  /**
   * 
   * @description database name
   */
  get name () {
    return this.config.db_name ?? 'main';
  }

  /**
   * 
   * @description Get the `storecraft` app
   */
  get app() { 
    return this.#app; 
  }

  /**
   * 
   * @description Get the native `mongodb` client
   */
  get mongo_client() {
    if(!this.config.db_name || !this.config.url) {
      throw new Error('MongoVectorStore::client() - missing url or db_name');
    }
      
    this.#mongo_client = this.#mongo_client ?? new MongoClient(
      this.config.url, this.config.options
    );
  
    return this.#mongo_client;
  }

  /**
   * 
   * @description Get the config object
   */
  get config() { 
    return this.#config; 
  }

  /**
   * 
   * @template {BaseType} T
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
