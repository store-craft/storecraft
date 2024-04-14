import { StorecraftAdminSDK } from './index.js'
import { fetchApiWithAuth } from './utils.api.fetch.js';

export default class Statistics  {
  /** @type {StorecraftAdminSDK} */
  #sdk;
  /** @type {Record<string, any>} */
  #cache = {};

  /**
   * 
   * @param {StorecraftAdminSDK} sdk 
   */
  constructor(sdk) {
    this.#sdk = sdk
  }

  /**
   * Get the count of documents in a query of a collection
   * @param {string} which_table collection ID
   * @param {string} vql `vql` search query
   */
  countOf = async (which_table, vql) => {
    return 5;
    // let q = {}
    // if (Array.isArray(search) && search.length)
    //   q.where = [ ['search', 'array-contains-any', search] ]

    // return this.db.col(colId).count(q)
  }

  /**
   * @param {string} key
   * 
   *  @returns {boolean} 
   */
  isCacheValid = key => {
    return false;
    // return this.cache[key] && 
    // (Date.now()-this.cache[key].updatedAt)<HOUR
  }

  /**
   * 
   * @param {string} key 
   * @returns {import('@storecraft/core/v-api').OrdersStatisticsType}
   */
  fromCache = (key) => {
    if(this.isCacheValid(key))
      return this.#cache[key]
    return undefined
  }

  /**
   * 
   * @param {string} key 
   * @param {import('@storecraft/core/v-api').OrdersStatisticsType} value
   */
  putCache = (key, value) => {
    this.#cache[key] = value
  }


  /**
   * Load **Orders** `statistics`
   * 
   * @param {string | number | Date} [from_day] `ISO` string | `UTC` | `timestamp` | `Date`
   * @param {string | number | Date} [to_day] `ISO` string | `UTC` | `timestamp` | `Date`
   * 
   * @returns {Promise<import('@storecraft/core/v-api').OrdersStatisticsType>}
   */
  orders = async (from_day, to_day) => {
    const search = new URLSearchParams();
    
    if(from_day)
      search.set('fromDay', new Date(from_day).toISOString());
    if(to_day)
      search.set('toDay', new Date(to_day).toISOString());

    return fetchApiWithAuth(
      `statistics/orders?${search.toString()}`
    );
  }


}