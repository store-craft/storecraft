import { calculate_pricing } from '@storecraft/core/v-api/con.pricing.logic.js';
import { StorecraftSDK } from '../index.js'
import { collection_base } from './utils.api.fetch.js';

/**
 * Base `orders` **CRUD**
 * 
 * @extends {collection_base<
 *  import('@storecraft/core/v-api').OrderDataUpsert, 
 *  import('@storecraft/core/v-api').OrderData>
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

  /**
   * @description calculate pricing of line items
   * 
   * @param {import('@storecraft/core/v-api').LineItem[]} line_items 
   * @param {import('@storecraft/core/v-api').DiscountType[]} coupons 
   * @param {import('@storecraft/core/v-api').ShippingMethodType} shipping_method 
   * @param {string} [uid] 
   */
  calculatePricing = async (
    line_items, coupons=[], shipping_method, uid
  ) => {
    // fetch auto discounts
    const auto_discounts = await this.sdk.discounts.list(
      {
        limit: 100, 
        vql: 'app:automatic'
      }
    );

    return await calculate_pricing(
      line_items, auto_discounts, coupons, shipping_method, uid
    );
  }

}