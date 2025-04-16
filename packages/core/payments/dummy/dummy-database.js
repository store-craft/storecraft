/**
 * @import { Config } from './dummy-database.types.js'
 */

/**
 * A simple `key-value` database, requires `node.js`
 * @template T
 */
export class DummyDatabase {
  /** @type {Record<string, T>} */
  #db={};
  #has_loaded=false;

  /**
   * @param {Config} config 
   */
  constructor(config={}) {
    this.config = config;
  }

  async #lazy_load() {
    if(this.hasLoaded)
      return;

    try {
      const db = await this.config?.persistance_provider?.load();
      if(db) {
        this.#db = db;
      }
    } catch (e) {
      console.log(e);
    }
  }

  async #save() {
    await this.config?.persistance_provider?.save(
      this.#db
    );
  }

  get hasLoaded() {
    return this.#has_loaded;
  }

  /**
   * @param {string} key 
   * @returns {Promise<T>}
   */
  async get(key) {
    await this.#lazy_load();
    return this.#db[key];
  }

  /**
   * @param {string} key 
   * @param {T} value 
   * @returns {Promise<boolean>}
   */
  async set(key, value) {
    await this.#lazy_load();
    this.#db[key] = value;
    try {
      await this.#save();
    } catch(e) {
      return false;
    } 

    return true;
  }
  
}