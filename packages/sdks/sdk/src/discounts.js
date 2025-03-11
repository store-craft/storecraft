/**
 * @import { DiscountType, DiscountTypeUpsert } from '@storecraft/core/api'
 */
import { StorecraftSDK } from '../index.js'
import { collection_base } from './utils.api.fetch.js';

/**
 * @description Base `discounts` **CRUD**
 * 
 * @extends {collection_base<DiscountTypeUpsert, DiscountType>}
 */
export default class Discounts extends collection_base {

  /**
   * 
   * @param {StorecraftSDK} sdk 
   */
  constructor(sdk) {
    super(sdk, 'discounts');
  }

}