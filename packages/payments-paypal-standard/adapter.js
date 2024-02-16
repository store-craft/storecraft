import { CheckoutStatusEnum, PaymentOptionsEnum } from '@storecraft/core';
import { fetch_with_auth } from './adapter.utils.js';

/**
 * @typedef {import('./types.private.js').paypal_order} CreateResult
 * @typedef {import('@storecraft/core').CheckoutStatusOptions} CheckoutStatusOptions
 * @typedef {import('@storecraft/core').OrderData} OrderData
 * @typedef {import('./types.public.js').Config} Config
 * @typedef {import('@storecraft/core/v-payments').payment_gateway<Config, CreateResult>} payment_gateway
 * @implements {payment_gateway}
 */
export class PaypalStandard {
  
  /** @type {Config} */ #_config;

  /**
   * 
   * @param {Config} config 
   */
  constructor(config) {
    this.#_config = config;
  }

  get config() { return this.#_config; }

  /**
   * TODO: the user prefers to capture intent instead
   * @param {OrderData} order 
   */
  async onCheckoutCreate(order) {
    const { currency_code } = this.config; 

    /** @type {import('./types.private.js').paypal_order_request} */
    const body = {
      intent: 'AUTHORIZE',
      purchase_units: [
        {
          custom_id: order.id,
          amount: {
            currency_code: currency_code,
            value: order.pricing.total.toFixed(2),
          },
          invoice_id: `${order.id}_${Date.now()}`
        },
      ],
    }

    const response = await fetch_with_auth(
      this.config, 'v2/checkout/orders', {
        method: 'post', body: JSON.stringify(body),
      }
    );

    /** @type {CreateResult} */
    const json = await response.json();
    return json;
  }

  /**
   * 
   * @param {CreateResult} create_result 
   * @return {ReturnType<payment_gateway["onCheckoutComplete"]>} create_result 
   */
  async onCheckoutComplete(create_result) {

    const response = await fetch_with_auth(
      this.config, 
      `v2/checkout/orders/${create_result.id}/authorize`, 
      { method: 'post' }
    );

    if(!response.ok) {
      const errorMessage = await response.text()
      throw new Error(errorMessage)
    }
    
    /** @type {import('./types.private.js').paypal_order_authorize_response} */
    const payload = await response.json();
    
    switch(payload.status) {
      case 'COMPLETED':
        return {
          // @ts-ignore
          payment: PaymentOptionsEnum.authorized,
          // @ts-ignore
          checkout: CheckoutStatusEnum.complete
        }
      case 'PAYER_ACTION_REQUIRED':
        return {
          // @ts-ignore
          checkout: CheckoutStatusEnum.requires_action
        }
      default:
        return {
          // @ts-ignore
          checkout: CheckoutStatusEnum.failed
        }
    }
  }

  /**
   * 
   * @param {CreateResult} create_result 
   */
  async status(create_result) {
    return null;
  }

  /**
   * 
   * @param {Request} request 
   */
  async webhook(request) {
    return null;
  }

}

