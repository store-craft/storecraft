import { StorecraftSDK } from '../index.js'
import { LS } from './utils.browser.js'

export default class Perfs {

  /**@type {Object.<string, any>} */
  #_perfs = {}

  /**
   * 
   * @param {StorecraftSDK} context 
   */
  constructor(context) {
    this.context = context
    this.PERFS_KEY = `storecraft_${context.config.email}_perfs`
    this.#_perfs = LS.get(this.PERFS_KEY) ?? {}
  }

  save = () => LS.set(this.PERFS_KEY, this.#_perfs);

  all = () => this.#_perfs;
  
  /**
   * 
   * @param {string} key 
   */
  get = (key) => this.#_perfs?.[key]

  /**
   * 
   * @param {string} key 
   * @param {any} value 
   */
  set = (key, value) => {
    this.#_perfs[key] = value;
    this.save()
  }

  init() {
  }

}