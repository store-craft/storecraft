/**
 * @import { PaymentGatewayItemGet, PaymentGatewayStatus } from '@storecraft/core/api'
 */
import { StorecraftSDK } from '../index.js'
import { 
  fetchApiWithAuth, get, list 
} from './utils.api.fetch.js';

/**
 * @description payment gateways
 */
export default class Payments {

  /** @type {StorecraftSDK} */
  #sdk = undefined;
  
  /**
   * 
   * @param {StorecraftSDK} sdk 
   */
  constructor(sdk) {
    this.#sdk = sdk;
  }

  /**
   * 
   * @param {string} handle payment gateway `handle`
   * 
   * 
   * @returns {Promise<PaymentGatewayItemGet>}
   */
  get(handle) {
    return get(this.sdk, 'payments/gateways', handle);
  }

  /**
   * 
   * 
   * @returns {Promise<PaymentGatewayItemGet[]>}
   */
  list() {
    return list(this.sdk, 'payments/gateways');
  }


  /**
   * 
   * Consult with the `payment` gateway about the payment
   * status of an `order`.
   * 
   * 
   * @param {string} order_id 
   * 
   * @returns {Promise<PaymentGatewayStatus>}
   */
  paymentStatusOfOrder(order_id) {
    return fetchApiWithAuth(
      this.sdk, 
      `/payments/status/${order_id}`,
      {
        method: 'get'
      }
    )
  }
  
  /**
   * 
   * Invoke a `payment gateway` action on `order`. The list of available actions can be found
   * using {@link get} or {@link paymentStatusOfOrder}
   * 
   * 
   * @param {string} action_handle The `action` handle at the gateway
   * @param {string} order_id the `id` of the `order`
   * 
   * 
   * @returns {Promise<PaymentGatewayStatus>}
   */
  invokeAction(action_handle, order_id) {
    return fetchApiWithAuth(
      this.sdk, 
      `/payments/${action_handle}/${order_id}`,
      {
        method: 'post'
      }
    )
  }
  

  get sdk() {
    return this.#sdk;
  }

}