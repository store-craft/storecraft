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
import Perfs from './src/perfs.js'
import { LS } from './src/utils.browser.js'
import Storage from './src/storage.js'

/**
 * @typedef {object} StorecraftConfig
 * @property {string} [email]
 * @property {string} [endpoint]
 * @property {import('./src/auth.js').ApiAuthResult} [auth]
 */

/**
 * The official `storecraft` admin **SDK** for `javascript`
 */
export class StorecraftAdminSDK {

  #_has_inited = false;

  /**@type {StorecraftConfig} */
  #_config = undefined;

  constructor() {
  }

  /**
   * @param {StorecraftConfig} [config] 
   */  
  async init(config) { 
    if(this.#_has_inited)
      return this;

    this.#_config = config
    this.auth = new Auth(this)
    this.storage = new Storage(this);

    this.customers = new Customers(this)
    this.tags = new Tags(this)
    this.products = new Products(this)

    this.orders = new Orders(this)
    this.collections = new Collections(this)
    this.discounts = new Discounts(this)
    this.shipping = new ShippingMethods(this)
    this.storefronts = new StoreFronts(this)
    this.statistics = new Statistics(this)
    this.images = new Images(this)
    this.posts = new Posts(this)
    // this.payment_gateways = new PaymentGateways(this)
    this.settings = new Settings(this)
    this.notifications = new Notifications(this)
    this.bots = new Bots(this)
    this.perfs = new Perfs(this)

    this.auth.init()
    // this.bots.init()

    const that = this;

    this.auth.add_sub(
      ([u, isAuth]) => {
        if(isAuth) {
          // that.settings.get('main')
        }
      }
    )
    console.log('tomer')
    this.#_has_inited=true
  }

  get config() {
    return this.#_config
  }

  get hasInited() {
    return this.#_has_inited
  }
}

export const sdk = new StorecraftAdminSDK()

const CONFIG_KEY = `storecraft_latest_config`

/**
 * 
 * @returns {boolean}
 */
export const hasSDKInit = () => { 
  return sdk.hasInited
}

/**
 * @param {StorecraftConfig} config 
 */
export const initSDK = (config) => {
  if(!hasSDKInit()) {
    console.log(
      'Storecraft:: trying to init with config', 
      config
    );

    try {
      sdk.init(config);

      LS.set(CONFIG_KEY, config);

      console.log('Storecraft:: inited');

    } catch (err) {
      console.log('Storecraft:: init error', err);

      throw err
    }
  }
  // save config
  return sdk
}

/**
 * 
 * @returns {StorecraftConfig}
 */
export const getLatestConfig = () => {
  return LS.get(CONFIG_KEY)
}

export const getSDK = () => { 
  if(!sdk.hasInited) {

    const config = getLatestConfig();

    if(!config)
      throw(
        'Storecraft SDK has not inited \
        and does not have a stored config'
      );

    return initSDK(config)
  }
  return sdk
}



