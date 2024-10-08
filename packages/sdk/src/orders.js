import { StorecraftSDK } from '../index.js'
import { collection_base } from './utils.api.fetch.js';

/**
 * @description Base `orders` **CRUD**
 * 
 * @extends {collection_base<
 *  import('@storecraft/core/api').OrderDataUpsert, 
 *  import('@storecraft/core/api').OrderData>
 * }
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