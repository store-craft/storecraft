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
 * @typedef {import('./types.public.js').Config} Config
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
 * @typedef {import('@storecraft/core').db_driver} db_driver
 * @implements {db_driver}
 */
export class MongoDB {

  /** @type {boolean} */ #_is_ready;
  /** @type {App<any, any, any>} */ #_app;
  /** @type {MongoClient} */ #_mongo_client;
  /** @type {string[]} */ #_admins_emails;
  /** @type {Config} */ #_config;

  /**
   * 
   * @param {Config} [config] config, if undefined, 
   * env variables will be used for uri upon init later
   */
  // constructor(db_name='main') {
  constructor(config) {
    // this.#_name = db_name;
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
    this.#_config = this.#_config ?? {
      url: app.platform.env.MONGODB_URI,
      db_name: 'main'
    }
    this.#_mongo_client = await connect(
      this.config.url,
      this.config.options
    );
    this.#_admins_emails = app.platform.env.DB_ADMINS_EMAILS?.split(',').map(
      s => s.trim()) ?? [];
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

    console.log(this.admins_emails)

    return this;
  }

  get isReady() { return this.#_is_ready; }
  
  /**
   * database name
   */
  get name () {
    return this.config.db_name ?? 'main';
  }

  get app() { return this.#_app; }

  /**
   * admins emails
   */
  get admins_emails () {
    return this.#_admins_emails ?? [];
  }

  get mongo_client() {
    return this.#_mongo_client;
  }

  get config() { return this.#_config; }

  /**
   * @template {import('@storecraft/core').BaseType} T
   * @param {string} name 
   * @returns {Collection<T>}
   */
  collection(name) {
    return this.mongo_client.db(this.name).collection(name);
  }

}
