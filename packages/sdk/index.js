import Auth from './src/auth.js'
import Customers from './src/customers.js'
import Tags from './src/tags.js'
import Products from './src/products.js'
import Orders from './src/orders.js'
import Discounts from './src/discounts.js'
import Collections from './src/collections.js'
import ShippingMethods from './src/shipping-methods.js'
import StoreFronts from './src/storefronts.js'
import Statistics from './src/statistics.js'
import Images from './src/images.js'
import Posts from './src/posts.js'
import PaymentGateways from './src/payment_gateways.js'
import Settings from './src/settings.js'
import Notifications from './src/notifications.js'
import Bots from './src/bots.js'
import Storage from './src/storage.js'


/**
 * @typedef {import('@storecraft/core/v-api').ApiAuthResult |
 *  import('@storecraft/core/v-api').ApiKeyResult
 * } SdkConfigAuth The `storecraft` **SDK** `auth` config, represents
 * either `apikey` or `jwt` authentication
 * 
 */


/**
 * 
 * @typedef {object} StorecraftConfig The `storecraft` **SDK** config
 * @property {string} [endpoint] Endpoint of `backend`
 * @property {SdkConfigAuth} [auth] `auth` info, may be either `apikey` or
 * `jwt` results
 */

/**
 * The official `storecraft` admin **SDK** for `javascript`
 */
export class StorecraftSDK {

  /**@type {StorecraftConfig} */
  #_config = undefined;

  /**
   * @param {StorecraftConfig} [config] 
   */  
  constructor(config) {
    this.#_config = config;

    this.auth = new Auth(this);
    this.storage = new Storage(this);

    this.customers = new Customers(this);
    this.tags = new Tags(this);
    this.products = new Products(this);
    this.orders = new Orders(this);
    this.collections = new Collections(this);
    this.discounts = new Discounts(this);
    this.shipping = new ShippingMethods(this);
    this.storefronts = new StoreFronts(this);
    this.statistics = new Statistics(this);
    this.images = new Images(this);
    this.posts = new Posts(this);
    // this.payment_gateways = new PaymentGateways(this)
    this.settings = new Settings(this);
    this.notifications = new Notifications(this);
    this.bots = new Bots(this);
  }

  /**
   * @param {StorecraftConfig} [config] 
   */  
  updateConfig(config) {
    this.#_config = config;
  }

  get config() {
    return this.#_config
  }

}

/**
 * @param {StorecraftConfig} config 
 */
export const validateConfig = (config) => {
  return true;
}

/**
 * @param {StorecraftConfig} [config] 
 */  
export const create = (config) => { 
  const sdk = new StorecraftSDK(config);
  
  return sdk;
}



