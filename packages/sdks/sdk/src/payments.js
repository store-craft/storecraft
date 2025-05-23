/**
 * @import { 
 *  PaymentGatewayItemGet, PaymentGatewayStatus 
 * } from '@storecraft/core/api'
 */
import { StorecraftSDK } from '../index.js'
import { 
  fetchApiWithAuth, get_from_collection_resource, 
  list_from_collection_resource, 
  url
} from './utils.api.fetch.js';

/**
 * @description payment gateways
 */
export default class Payments {

  /** @type {StorecraftSDK} */
  #sdk = undefined;
  
  /**
   * @param {StorecraftSDK} sdk 
   */
  constructor(sdk) {
    this.#sdk = sdk;
  }

  /**
   * @param {string} handle payment gateway `handle`
   * @returns {Promise<PaymentGatewayItemGet>}
   */
  get(handle) {
    return get_from_collection_resource(
      this.sdk, 'payments/gateways', handle
    );
  }

  /**
   * @returns {Promise<PaymentGatewayItemGet[]>}
   */
  list() {
    return list_from_collection_resource(
      this.sdk, 'payments/gateways'
    );
  }


  /**
   * Consult with the `payment` gateway about the payment
   * status of an `order`.
   * @param {string} order_id 
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
   * Invoke a `payment gateway` action on `order`. 
   * The list of available actions can be found
   * using {@link get_from_collection_resource} or 
   * {@link paymentStatusOfOrder}
   * @param {string} action_handle The `action` handle at the gateway
   * @param {string} order_id the `id` of the `order`
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

  /**
   * Get an optional HTML Pay UI of the `payment gateway`
   * @param {string} order_id the `id` of the `order`
   * @returns {Promise<string>} `html` of the `payment gateway` UI
   */
  getBuyUI(order_id) {
    return fetchApiWithAuth(
      this.sdk, 
      `/payments/buy_ui/${order_id}`,
      {
        method: 'get'
      }
    )
  }
    
  /**
   * Get an optional HTML Pay UI of the `payment gateway`
   * @param {string} order_id the `id` of the `order`
   * @returns {string} buy UI url
   */
  getBuyUiUrl(order_id) {
    return url(
      this.sdk.config, 
      `/payments/buy_ui/${order_id}`
    );
  }
  
  /**
   * invoke the webhook endpoint for async payment
   * @param {string} gateway_handle The handle of the `payment gateway`
   * @param {any} [body={}] Payload for the gateway webhook. This is specific to the
   * `payment gateway` and the `webhook` endpoint.
   * @returns {Promise<string>}
   */
  webhook(gateway_handle, body={}) {
    return fetchApiWithAuth(
      this.sdk, 
      `/payments/gateways/${gateway_handle}/webhook`,
      {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    )
  }  

  get sdk() {
    return this.#sdk;
  }

}