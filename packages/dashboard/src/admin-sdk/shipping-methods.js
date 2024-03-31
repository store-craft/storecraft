import { StorecraftAdminSDK } from './index.js'
import { collection_base } from './utils.api.fetch.js';

/**
 * Base `shipping` **CRUD**
 * 
 * @extends {collection_base<import('@storecraft/core/v-api').ShippingMethodTypeUpsert, 
 * import('@storecraft/core/v-api').ShippingMethodType>}
 */
export default class Shipping extends collection_base {

  /**
   * 
   * @param {StorecraftAdminSDK} sdk 
   */
  constructor(sdk) {
    super(sdk, 'shipping');
  }

}