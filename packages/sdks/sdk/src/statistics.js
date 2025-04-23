/**
 * @import { OrdersStatisticsType, ApiQuery } from '@storecraft/core/api'
 */
import { App } from '@storecraft/core';
import { StorecraftSDK } from '../index.js'
import { fetchApiWithAuth } from './utils.api.fetch.js';
import { 
  api_query_to_searchparams 
} from '@storecraft/core/api/query.js';

/**
 * @description statistics endpoint
 */
export default class Statistics  {
  /** @type {StorecraftSDK} */
  #sdk;

  /**
   * @param {StorecraftSDK} sdk 
   */
  constructor(sdk) {
    this.#sdk = sdk
  }

  get sdk() {
    return this.#sdk;
  }

  /**
   * @description Load **Orders** `statistics`
   * @param {string | number | Date} [from_day] 
   * `ISO` string | `UTC` | `timestamp` | `Date`
   * @param {string | number | Date} [to_day] 
   * `ISO` string | `UTC` | `timestamp` | `Date`
   * @returns {Promise<OrdersStatisticsType>}
   */
  orders = async (from_day, to_day) => {
    const search = new URLSearchParams();
    
    if(from_day) {
      search.set(
        'fromDay', 
        new Date(from_day).toISOString()
      );
    }
    if(to_day) {
      search.set(
        'toDay', 
        new Date(to_day).toISOString()
      );
    }

    return fetchApiWithAuth(
      this.sdk, 
      `statistics/orders?${search.toString()}`
    );
  }

  /**
   * @description Load **count** `statistics`
   * @param {keyof App["db"]["resources"]} table 
   * @param {ApiQuery} [query]
   * @returns {Promise<number>}
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