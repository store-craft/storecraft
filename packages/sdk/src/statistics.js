import { App } from '@storecraft/core';
import { StorecraftSDK } from '../index.js'
import { fetchApiWithAuth } from './utils.api.fetch.js';
import { api_query_to_searchparams } from '@storecraft/core/v-api/utils.query.js';

export default class Statistics  {
  /** @type {StorecraftSDK} */
  #sdk;
  /** @type {Record<string, any>} */
  #cache = {};

  /**
   * 
   * @param {StorecraftSDK} sdk 
   */
  constructor(sdk) {
    this.#sdk = sdk
  }

  get sdk() {
    return this.#sdk;
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
      this.sdk, 
      `statistics/orders?${search.toString()}`
    );
  }

  /**
   * Load **count** `statistics`
   * 
   * @param {keyof App["db"]["resources"]} table 
   * @param {import('@storecraft/core/v-api').ApiQuery} [query]
   * 
   * 
   * @returns {Promise<number>}
   * 
   * 
   * @throws
   */
  countOf = async (table, query) => {
    const search = api_query_to_searchparams(query);

    return fetchApiWithAuth(
      this.sdk, 
      `statistics/count/${table}?${search.toString()}`
    );
  }

}