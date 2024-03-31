import { StorecraftAdminSDK } from './index.js'
import { collection_base } from './api.fetch.js';

/**
 * Base `orders` **CRUD**
 * 
 * @extends {collection_base<import('@storecraft/core/v-api').OrderDataUpsert, 
 * import('@storecraft/core/v-api').OrderData>}
 */
export default class Orders extends collection_base {

  /**
   * 
   * @param {StorecraftAdminSDK} sdk 
   */
  constructor(sdk) {
    super(sdk, 'orders');
  }

  /**
   * calculate pricing of line items
   * 
   * @param {LineItem[]} line_items 
   * @param {DiscountData[]} auto_discounts 
   * @param {DiscountData[]} coupons 
   * @param {ShippingData} shipping_method 
   * @param {string} [uid] 
   */
  calculatePricing = 
  async (line_items, coupons=[], shipping_method, uid) => {
    // fetch auto discounts
    let auto_discounts = await this.context.discounts.list(['app:0'])
    auto_discounts = auto_discounts.map(t => t[1])
    console.log('auto_discounts', auto_discounts)
    return calculate_pricing(
      line_items, auto_discounts, coupons, shipping_method, uid
      )
  }

}