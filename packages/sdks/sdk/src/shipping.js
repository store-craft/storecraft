/**
 * @import { ShippingMethodTypeUpsert, ShippingMethodType } from '@storecraft/core/api'
 */
import { StorecraftSDK } from '../index.js'
import { collection_base } from './utils.api.fetch.js';

/**
 * @description Base `shipping` **CRUD**
 * @extends {collection_base<ShippingMethodTypeUpsert, ShippingMethodType>}
 */
export default class Shipping extends collection_base {

  /**
   * @param {StorecraftSDK} sdk 
   */
  constructor(sdk) {
    super(sdk, 'shipping');
  }

}