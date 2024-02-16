import { getAccessToken, with_auth } from './adapter.utils.js';

/**
 * @typedef {string} CreateResult
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

    const response = await with_auth(
      this.config, 'v2/checkout/orders',
      {
        method: 'post',
        body: JSON.stringify(body),
      }
    );

    return response.json();
  }

  /**
   * 
   * @param {CreateResult} create_result 
   */
  async onCheckoutComplete(create_result) {
    return null;
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

