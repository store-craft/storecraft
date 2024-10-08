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
   * @param {import('@storecraft/core/api').CheckoutCreateType} input 
   * @param {string} gateway_handle 
   * 
   * @returns {Promise<Partial<import('@storecraft/core/api').OrderData>>}
   */
  create = async (input, gateway_handle) => {

    console.log('input', input)
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
   * @returns {Promise<Partial<import('@storecraft/core/api').OrderData>>}
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
   * @description calculate the pricing of an `order`. Using auto-discounts, coupons, shipping and line-items.
   * 
   * @param {Partial<import('@storecraft/core/api').OrderData>} order 
   * 
   * @returns {Promise<Partial<import('@storecraft/core/api').PricingData>>}
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