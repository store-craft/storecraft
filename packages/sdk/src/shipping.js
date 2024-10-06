import { StorecraftSDK } from '../index.js'
import { collection_base } from './utils.api.fetch.js';

/**
 * @description Base `shipping` **CRUD**
 * 
 * @extends {collection_base<
 *  import('@storecraft/core/api').ShippingMethodTypeUpsert, 
 *  import('@storecraft/core/api').ShippingMethodType>
 * }
 */
export default class Shipping extends collection_base {

  /**
   * 
   * @param {StorecraftSDK} sdk 
   */
  constructor(sdk) {
    super(sdk, 'shipping');
  }

}