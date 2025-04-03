/**
 * @import { Config } from './types.public.js'
 * @import { ENV } from '@storecraft/core';
 * @import { OrderData, PaymentGatewayStatus } from '@storecraft/core/api'
 * @import { payment_gateway } from '@storecraft/core/payments'
 * @import { paypal_order, paypal_order_request } from './types.private.js'
*/
import { 
  CheckoutStatusEnum, PaymentOptionsEnum 
} from '@storecraft/core/api/types.api.enums.js';
import { fetch_with_auth, throw_bad_response } from './adapter.utils.js';
import { StorecraftError } from '@storecraft/core/api/utils.func.js';
import html_buy_ui from './adapter.html.js';

/**
 * @typedef {paypal_order} CreateResult
 * @typedef {payment_gateway<Config, CreateResult>} Impl
 */


/**
 * @description **Paypal Payment** gateway (https://developer.paypal.com/docs/checkout/)
 * 
 * @implements {Impl}
*/
export class Paypal {
  
  /** @satisfies {ENV<Config>} */
  static EnvConfigProd = /** @type{const} */ ({
    client_id: `PAYPAL_CLIENT_ID_PROD`,
    secret: 'PAYPAL_SECRET_PROD',
  });

  /** @satisfies {ENV<Config>} */
  static EnvConfigTest = /** @type{const} */ ({
    client_id: `PAYPAL_CLIENT_ID_TEST`,
    secret: 'PAYPAL_SECRET_TEST',
  });

  /** @type {Config} */ #_config;

  /**
   * 
   * @param {Config} config 
   */
  constructor(config={}) {
    // this.#_config = this.#validate_and_resolve_config(config);
    this.#_config = {
      default_currency_code: 'USD',
      env: 'prod',
      intent_on_checkout: 'AUTHORIZE',
      ...config,
    }
  }

  /** @type {Impl["onInit"]} */
  onInit = (app) => {
    const is_prod = Boolean(this.config.env==='prod');
    this.config.client_id ??= app.platform.env[
      is_prod ? Paypal.EnvConfigProd.client_id : Paypal.EnvConfigTest.client_id
    ] ?? app.platform.env['PAYPAL_CLIENT_ID'];

    this.config.secret ??= app.platform.env[
      is_prod ? Paypal.EnvConfigProd.secret : Paypal.EnvConfigTest.secret
    ] ?? app.platform.env['PAYPAL_SECRET'];

    const is_valid = this.config.client_id && this.config.secret;

    if(!is_valid) {
      throw new StorecraftError(
        `Payment gateway ${this.info.name ?? 'unknown'} has invalid config !!! 
        Missing client_id or secret`
      )
    }
  }

  get info() {
    return {
      name: 'Paypal payments',
      description: `Set up standard and advanced payments to present payment buttons to your payers so they can pay with PayPal, debit and credit cards, Pay Later options, Venmo, and alternative payment methods.
      You can get started quickly with this 15-minute copy-and-paste integration. If you have an older Checkout integration, you can upgrade your Checkout integration.`,
      url: 'https://developer.paypal.com/docs/checkout/',
      logo_url: 'https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg'
    }
  }
  
  get config() { 
    return this.#_config; 
  }

  get actions() {
    return [
      {
        handle: 'capture',
        name: 'Capture',
        description: 'Capture an authorized payment'
      },
      {
        handle: 'void',
        name: 'Void',
        description: 'Cancel an authorized payment'
      },
      {
        handle: 'refund',
        name: 'Refund',
        description: 'Refund a captured payment'
      },
    ]
  }

  /**
   * 
   * @type {Impl["invokeAction"]}
   */
  invokeAction(action_handle) {
    switch (action_handle) {
      case 'capture':
        return this.capture.bind(this);
      case 'void':
        return this.void.bind(this);
      case 'refund':
        return this.refund.bind(this);
    
      default:
        break;
    }
  }

  /**
   * @type {Impl["onBuyLinkHtml"]}
   */
  async onBuyLinkHtml(order) {

    return html_buy_ui(
      this.config, order
    )
  }

  /**
   * @description TODO: the user prefers to capture intent instead
   * 
   * @type {Impl["onCheckoutCreate"]}
   */
  async onCheckoutCreate(order) {
    const { default_currency_code: currency_code, intent_on_checkout } = this.config; 

    /** @type {paypal_order_request} */
    const body = {
      intent: intent_on_checkout==='AUTHORIZE' ? 'AUTHORIZE' : 'CAPTURE',
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
        method: 'post', 
        body: JSON.stringify(body),
      }
    );

    await throw_bad_response(response);

    /** @type {CreateResult} */
    const json = await response.json();
    return json;
  }

  /**
   * @description todo: logic for if user wanted capture at approval
   * 
   * @type {Impl["onCheckoutComplete"]}
   */
  async onCheckoutComplete(create_result) {
    // the url based on authorize or capture intent
    const url = this.config.intent_on_checkout==='AUTHORIZE' ? 
          `v2/checkout/orders/${create_result.id}/authorize` : 
          `v2/checkout/orders/${create_result.id}/capture`;
    const response = await fetch_with_auth(
      this.config, url, 
      { method: 'post' }
    );

    await throw_bad_response(response);
    
    /** @type {paypal_order} */
    const payload = await response.json();
    
    let status;
    switch(payload.status) {
      case 'COMPLETED':
        status = {
          payment: PaymentOptionsEnum.authorized,
          checkout: CheckoutStatusEnum.complete
        }
        break;
      case 'PAYER_ACTION_REQUIRED':
        status = {
          checkout: CheckoutStatusEnum.requires_action
        }
        break;
      default:
        status = {
          checkout: CheckoutStatusEnum.failed
        }
        break;
    }

    return {
      status,
      onCheckoutComplete: payload
    }
  }

  /**
   * @description Fetch the order and analyze it's status
   * 
   * @type {Impl["status"]}
   */
  async status(create_result) {
    const o = await this.retrieve_order(create_result);
    const purchase_unit = o.purchase_units?.[0];
    const authorization = purchase_unit?.payments?.authorizations?.[0];
    const capture = purchase_unit?.payments?.captures?.[0];
    const refund = purchase_unit?.payments?.refunds?.[0];

    /** @type {PaymentGatewayStatus} */
    const stat = {
      messages: [],
      actions: this.actions
    }

    /** @param {typeof authorization | typeof capture | typeof refund} u */
    const get_values = u => {
      return {
        currency_code: u.amount.currency_code,
        price: u.amount.value,
        reason: u?.status_details?.reason,
        create_time: new Date(u?.create_time).toUTCString(),
        update_time: new Date(u?.update_time).toUTCString(),
        id: u?.id, status: u.status
      }
    }

    if(refund) {
      const v = get_values(refund);
      stat.messages = [
        `**${v.price}${v.currency_code}** were tried to be \`REFUNDED\` at \`${v.create_time}\``,
        `The status is \`${v.status}\`, updated at \`${v.update_time}\``,
        v.reason && `The reason for this status is \`${v.reason}\``,
        `Refund ID is \`${v.id}\`.`
      ].filter(Boolean);

    } else if(capture) {
      const v = get_values(capture);
      stat.messages = [
        `**${v.price}${v.currency_code}** were tried to be \`CAPTURED\` at \`${v.create_time}\``,
        `The status is \`${v.status}\`, updated at \`${v.update_time}\``,
        v.reason && `The reason for this status is \`${v.reason}\``,
        `Capture ID is \`${v.id}\`.`
      ].filter(Boolean);
      
    } else if (authorization) {
      const v = get_values(authorization);
      const expiration_time = new Date(authorization?.expiration_time).toUTCString();
      stat.messages = [
        `**${v.price}${v.currency_code}** were tried to be \`AUTHORIZED\` at \`${v.create_time}\``,
        `The status is \`${authorization.status}\`, updated at \`${v.update_time}\``,
        `The authorization will expire at \`${expiration_time}\``,
        v.reason && `The reason for this status is \`${v.reason}\``,
        `Authorization ID is \`${v.id}\`.`
      ].filter(Boolean);
  
    } else { // just an intent
      const currency_code = purchase_unit.amount.currency_code;
      const price = purchase_unit.amount.value;
      stat.messages = [
        `An intent to **${o.intent}** of **${price}${currency_code}** was initiated`,
        `The status is \`${o.status}\``
      ];
    }
    
    return stat;
  }

  /**
   * @description [https://developer.paypal.com/api/rest/webhooks/rest/](https://developer.paypal.com/api/rest/webhooks/rest/)
   * 
   * @type {Impl["webhook"]}
   */
  async webhook(request) {
    throw new Error('Paypal:: webhook - not supported yet !');
    return null;
  }

  /**
   * @description Retrieve latest order payload
   * 
   * @param {CreateResult} create_result first create result, holds paypal id
   * 
   * @return {Promise<paypal_order>} 
   */
  retrieve_order = async (create_result) => {
    const response = await fetch_with_auth(
      this.config, 
      `v2/checkout/orders/${create_result.id}`, 
      { method: 'get' }
    );

    await throw_bad_response(response);

    /** @type {paypal_order} */
    const jsonData = await response.json();
    return jsonData;
  }  

  // actions

  /**
   * @description todo: logic for if user wanted capture at approval
   * 
   * @param {CreateResult} create_result 
   */
  async void(create_result) {
    const paypal_order = await this.retrieve_order(create_result);
    const authorization_id = paypal_order?.purchase_units?.[0]?.payments?.authorizations?.[0]?.id

    const response = await fetch_with_auth(
      this.config, 
      `v2/payments/authorizations/${authorization_id}/void`, 
      { method: 'post' }
    );

    await throw_bad_response(response);
    
    return this.status(create_result);
  }  

  /**
   * @description todo: logic for if user wanted capture at approval
   * 
   * @param {CreateResult} create_result 
   */
  async capture(create_result) {
    const paypal_order = await this.retrieve_order(create_result);
    const authorization_id = paypal_order?.purchase_units?.[0]?.payments?.authorizations?.[0]?.id

    const response = await fetch_with_auth(
      this.config, 
      `v2/payments/authorizations/${authorization_id}/capture`, 
      { method: 'post' }
    );

    await throw_bad_response(response);
    
    return this.status(create_result);
  }    

  /**
   * @description todo: logic for if user wanted capture at approval
   * 
   * @param {CreateResult} create_result 
   */
  async refund(create_result) {
    const paypal_order = await this.retrieve_order(create_result);
    const capture_id = paypal_order?.purchase_units?.[0]?.payments?.captures?.[0]?.id;

    const response = await fetch_with_auth(
      this.config, 
      `v2/payments/captures/${capture_id}/refund`, 
      { method: 'post' }
    );

    await throw_bad_response(response);
    
    return this.status(create_result);
  }

}

