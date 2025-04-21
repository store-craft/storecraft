/**
 * @import { 
 *  CheckoutCreateType, CheckoutCreateTypeAfterValidation, 
 *  OrderData, PricingData 
 * } from '@storecraft/core/api'
 */
import { StorecraftSDK } from '../index.js'
import { fetchApiWithAuth } from './utils.api.fetch.js';

/**
 * @description Base `checkout` **api**
 * 
 */
export default class Checkout {

  /**
   * 
   * @param {StorecraftSDK} sdk 
   */
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * @description Create a `checkout`
   * 
   * @param {CheckoutCreateType} input 
   * @param {string} gateway_handle 
   * 
   * @returns {Promise<Partial<OrderData>>}
   */
  create = async (input, gateway_handle) => {

    const result = await fetchApiWithAuth(
      this.sdk,
      `checkout/create?gateway=${gateway_handle}`,
      {
        method: 'post',
        body: JSON.stringify(input),
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return result
  }

  /**
   * @description Complete a `checkout`
   * 
   * @param {string} order_id 
   * 
   * @returns {Promise<Partial<OrderData>>}
   */
  complete = async (order_id) => {

    const result = await fetchApiWithAuth(
      this.sdk,
      `checkout/${order_id}/complete`,
      {
        method: 'post',
      }
    );

    return result
  }

  /**
   * @description calculate the pricing of an `order`. 
   * Using auto-discounts, coupons, shipping and line-items.
   * @param {CheckoutCreateTypeAfterValidation} order 
   * @returns {Promise<Partial<PricingData>>}
   */
  pricing = async (order) => {

    const result = await fetchApiWithAuth(
      this.sdk,
      `checkout/pricing`,
      {
        method: 'post',
        body: JSON.stringify(order),
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return result
  }

}