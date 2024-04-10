import Auth from './auth.js'
import Customers from './customers.js'
import Tags from './tags.js'
import Products from './products.js'
import Orders from './orders.js'
import Discounts from './discounts.js'
import Collections from './collections.js'
import ShippingMethods from './shipping-methods.js'
import StoreFronts from './storefronts.js'
import Stats from './stats.js'
import Images from './images.js'
import Posts from './posts.js'
import PaymentGateways from './payment_gateways.js'
import Settings from './settings.js'
import Notifications from './notifications.js'
import Bots from './bots.js'
import Perfs from './perfs.js'
import { LS } from './utils.browser.js'
import Storage from './storage.js'

/**
 * @typedef {object} StorecraftConfig
 * @property {string} [email]
 * @property {string} [endpoint]
 * @property {import('./auth.js').ApiAuthResult} [auth]
 */

export class StorecraftAdminSDK {
  #_has_inited = false
  /**@type {StorecraftConfig} */
  #_config = undefined

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
    // this.stats = new Stats(this)
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
    console.log('Storecraft:: trying to init with config', config)
    try {
      sdk.init(config);
      LS.set(CONFIG_KEY, config);
      console.log('Storecraft:: inited')
    } catch (err) {
      console.log('Storecraft:: init error', err)
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
    // test if we have a config stored
    const config = getLatestConfig()
    if(!config)
      throw('Storecraft SDK has not inited and does not have a stored config')
    return initSDK(config)
  }
  return sdk
}



