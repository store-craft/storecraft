/**
 * @import { OrderDataUpsert, OrderData } from '@storecraft/core/api'
 */
import { StorecraftSDK } from '../index.js'
import { collection_base } from './utils.api.fetch.js';

/**
 * @description Base `orders` **CRUD**
 * 
 * @extends {collection_base<OrderDataUpsert, OrderData>}
 */
export default class Orders extends collection_base {

  /**
   * 
   * @param {StorecraftSDK} sdk 
   */
  constructor(sdk) {
    super(sdk, 'orders');
  }

}