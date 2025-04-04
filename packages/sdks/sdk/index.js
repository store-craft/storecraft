/**
 * @import { StorecraftSDKConfig } from './types.js'
 */
import Auth from './src/auth.js'
import Customers from './src/customers.js'
import Tags from './src/tags.js'
import Templates from './src/templates.js'
import Products from './src/products.js'
import Orders from './src/orders.js'
import Discounts from './src/discounts.js'
import Collections from './src/collections.js'
import ShippingMethods from './src/shipping.js'
import StoreFronts from './src/storefronts.js'
import Statistics from './src/statistics.js'
import Images from './src/images.js'
import Posts from './src/posts.js'
import Checkout from './src/checkout.js'
import Payments from './src/payments.js'
import Settings from './src/settings.js'
import Notifications from './src/notifications.js'
import Storage from './src/storage.js'
import AI from './src/ai.js'
import Search from './src/search.js'
import { fetchApiWithAuth, fetchOnlyApiResponseWithAuth } from './src/utils.api.fetch.js'

/**
 * @description The official `storecraft` universal **SDK** for `javascript`
 */
export class StorecraftSDK {

  /**@type {StorecraftSDKConfig} */
  #_config = undefined;

  /**
   * @param {StorecraftSDKConfig} [config] 
   */  
  constructor(config) {
    this.#_config = config;

    this.ai = new AI(this);
    this.search = new Search(this);
    this.auth = new Auth(this);
    this.storage = new Storage(this);
    this.customers = new Customers(this);
    this.tags = new Tags(this);
    this.templates = new Templates(this);
    this.products = new Products(this);
    this.orders = new Orders(this);
    this.collections = new Collections(this);
    this.discounts = new Discounts(this);
    this.shipping = new ShippingMethods(this);
    this.storefronts = new StoreFronts(this);
    this.statistics = new Statistics(this);
    this.images = new Images(this);
    this.posts = new Posts(this);
    this.payments = new Payments(this);
    this.checkout = new Checkout(this);
    this.settings = new Settings(this);
    this.notifications = new Notifications(this);
  }

  /**
   * @description 
   * - Prepends `backend` endpoint. 
   * - Fetches with `authentication` middleware. 
   * - Refreshed `auth` if needed. 
   * - Throws a `json` representation of the `error`, 
   * if the request is `bad`
   * 
   * @template {any} [R=any]
   * 
   * @param {string} path relative path in api
   * @param {RequestInit} [init] request `init` type
   * @param {URLSearchParams} [query] url search params
   * 
   * @throws {error}
   * 
   * @returns {Promise<R>}
   */   
  fetchApiWithAuth = (path, init, query) => {
    return fetchApiWithAuth(
      this, path, init, query
    )
  }

  /**
   * @description 
   * - Prepends `backend` endpoint. 
   * - Fetches with `authentication` middleware. 
   * - Refreshed `auth` if needed. 
   * 
   * @param {string} path relative path in api
   * @param {RequestInit} [init] request `init` type
   * @param {URLSearchParams} [query] url search params
   * 
   * @returns {Promise<Response>}
   */   
  fetchOnlyApiResponseWithAuth = (path, init, query) => {
    return fetchOnlyApiResponseWithAuth(
      this, path, init, query
    )
  }

  /**
   * @param {StorecraftSDKConfig} [config] 
   */  
  updateConfig(config) {
    this.#_config = config;
  }

  get config() {
    return this.#_config
  }

}

/**
 * @param {StorecraftSDKConfig} config 
 */
export const validateConfig = (config) => {
  return true;
}

/**
 * @param {StorecraftSDKConfig} [config] 
 */  
export const create = (config) => { 
  const sdk = new StorecraftSDK(config);
  
  return sdk;
}



