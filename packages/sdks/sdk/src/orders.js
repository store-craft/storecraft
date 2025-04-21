/**
 * @import { OrderDataUpsert, OrderData, ApiQuery } from '@storecraft/core/api'
 */
import { api_query_to_searchparams } from '@storecraft/core/api/utils.query.js';
import { StorecraftSDK } from '../index.js'
import { collection_base, fetchApiWithAuth } from './utils.api.fetch.js';

/**
 * @description Base `orders` **CRUD**
 * 
 * @extends {collection_base<OrderDataUpsert, OrderData>}
 */
export default class Orders extends collection_base {

  /**
   * @param {StorecraftSDK} sdk 
   */
  constructor(sdk) {
    super(sdk, 'orders');
  }

  /**
   * @description List orders of current authenticated user
   * @param {ApiQuery<OrderData>} [query] 
   * @returns {Promise<OrderData[]>}
   */
  list_my_orders(
    query={}
  ) {
    const sq = api_query_to_searchparams(query);
    return fetchApiWithAuth(
      this.sdk, 
      `${this.base_name}/me?${sq.toString()}`,
      {
        method: 'get'
      }
    );
  }
}