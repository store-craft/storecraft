import { CheckoutStatusEnum, PaymentOptionsEnum } from '@storecraft/core/v-api/types.api.enums.js';
import { StorecraftError } from '@storecraft/core/v-api/utils.func.js';
import html_buy_ui from './adapter.html.js';
import { Stripe as StripeCls } from 'stripe'

/**
 * @typedef {StripeCls.Response<StripeCls.PaymentIntent>} CheckoutCreateResult
 * @typedef {import('@storecraft/core/v-api').PaymentGatewayStatus} PaymentGatewayStatus
 * @typedef {import('@storecraft/core/v-api').CheckoutStatusEnum} CheckoutStatusOptions
 * @typedef {import('@storecraft/core/v-api').OrderData} OrderData
 * @typedef {import('./types.public.js').Config} Config
 * @typedef {import('@storecraft/core/v-payments').payment_gateway<Config, CheckoutCreateResult>} payment_gateway
 */

/**
 * @implements {payment_gateway}
 * 
 * @description **Stripe** gateway (https://docs.stripe.com/payments/place-a-hold-on-a-payment-method)
 */
export class Stripe {
  
  /** @type {Config} */ #_config;

  /**
   * 
   * @param {Config} config 
   */
  constructor(config) {
    this.#_config = this.#validate_and_resolve_config(config);
    this.stripe = new StripeCls(
      this.#_config.secret_key, this.#_config.stripe_config ?? {}
    );
  }

  /**
   * 
   * @param {Config} config 
   */
  #validate_and_resolve_config(config) {
    config = {
      stripe_config: {
        httpClient: StripeCls.createFetchHttpClient()
      },
      stripe_intent_create_params: {
        currency: 'usd', 
        automatic_payment_methods: {
          enabled: true,
        },
        payment_method_options: {
          card: {
            capture_method: 'manual',
          },
        },
      },
      ...config,
    }

    const is_valid = config.publishable_key && config.secret_key;

    if(!is_valid) {
      throw new StorecraftError(
        `Payment gateway ${this.info.name ?? 'unknown'} has invalid config !!! 
        Missing client_id or secret`
      )
    }

    return config;
  }

  get info() {
    return {
      name: 'Stripe',
      description: `Stripe powers online and in-person payment processing and financial solutions for businesses of all sizes.`,
      url: 'https://docs.stripe.com/payments/place-a-hold-on-a-payment-method',
      logo_url: 'https://images.ctfassets.net/fzn2n1nzq965/HTTOloNPhisV9P4hlMPNA/cacf1bb88b9fc492dfad34378d844280/Stripe_icon_-_square.svg?q=80&w=256'
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
        handle: 'cancel',
        name: 'Cancel',
        description: 'Cancel an a payment'
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
   * @type {payment_gateway["invokeAction"]}
   */
  invokeAction(action_handle) {
    switch (action_handle) {
      case 'capture':
        return this.capture.bind(this);
      case 'cancel':
        return this.cancel.bind(this);
      case 'refund':
        return this.refund.bind(this);
    
      default:
        break;
    }
  }

  /**
   * @description (Optional) buy link ui
   * 
   * @param {Partial<OrderData>} order 
   * 
   * @return {Promise<string>} html 
   */
  async onBuyLinkHtml(order) {

    return html_buy_ui(
      this.config, order
    )
  }

  /**
   * @description TODO: the user prefers to capture intent instead
   * 
   * @param {OrderData} order 
   * 
   * @return {Promise<CheckoutCreateResult>}
   */
  async onCheckoutCreate(order) {

    const paymentIntent = await this.stripe.paymentIntents.create(
      {
        amount: Math.floor(order.pricing.total * 100),
        ...this.config.stripe_intent_create_params,
      }
    );

    return paymentIntent;
  }

  /**
   * @description todo: logic for if user wanted capture at approval
   * 
   * @param {CheckoutCreateResult} create_result 
   * 
   * @return {ReturnType<payment_gateway["onCheckoutComplete"]>}  
   */
  async onCheckoutComplete(create_result) {

    const intent = await this.stripe.paymentIntents.confirm(
      create_result.id
    );

    let status;
    switch(intent.status) {
      case 'succeeded':
        status = {
          payment: PaymentOptionsEnum.captured,
          checkout: CheckoutStatusEnum.complete
        }
        break;
      case 'requires_capture':
        status = {
          payment: PaymentOptionsEnum.authorized,
          checkout: CheckoutStatusEnum.complete
        }
        break;
      case 'requires_confirmation':
      case 'requires_action':
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
      onCheckoutComplete: intent
    }
  }

  /**
   * @description Fetch the order and analyze it's status
   * 
   * 
   * @param {CheckoutCreateResult} create_result 
   * 
   * 
   * @returns {Promise<PaymentGatewayStatus>}
   */
  async status(create_result) {
    const o = await this.retrieve_order(create_result);
    const lc = /** @type {StripeCls.Charge} */ (o.latest_charge);
    /** @param {number} a */
    const fmt = a => (a/100).toFixed(2) + o.currency.toUpperCase();

    /** @type {PaymentGatewayStatus} */
    const stat = {
      messages: [],
      actions: this.actions
    }

    if(o) { // just an intent
      const date = new Date(o.created).toUTCString();
      stat.messages = [
        `A payment intent of **${fmt(o.amount)}** was initiated at ${date}`,
        `The status is \`${o.status}\` and the ID is \`${o.id}\``
      ];
    }

    if(lc?.captured) {
      stat.messages.push(
        `**${fmt(lc.amount_captured)}** was \`CAPTURED\``,
      );
    }
    if(lc?.refunded) {
      const date = lc?.refunds?.data?.[0]?.created ? (new Date(lc?.refunds?.data?.[0]?.created).toUTCString()) : 'unknown time';
      stat.messages.push(
        `**${fmt(lc.amount_refunded)}** was \`REFUNDED\` at \`${date}\``,
      );
    }

    if(o?.canceled_at) {
      const date = new Date(o.canceled_at).toUTCString();
      stat.messages.push(
        ...[
          `Intent was \`CANCELLED\` at \`${date}\`.`,
          o.cancellation_reason && `Cancellation reason is ${o.cancellation_reason}`
        ].filter(Boolean)
      );
    }
    
    return stat;
  }

  /**
   * 
   * @param {Request} request 
   */
  async webhook(request) {
    return null;
  }

  /**
   * @description Retrieve latest order payload
   * 
   * @param {CheckoutCreateResult} create_result first create result, holds `Stripe` intent
   * 
   */
  retrieve_order = (create_result) => {
    return this.stripe.paymentIntents.retrieve(
      create_result.id, 
      { 
        expand: ['latest_charge']
      }
    )
  }  

  // actions

  /**
   * @description todo: logic for if user wanted capture at approval
   * 
   * @param {CheckoutCreateResult} create_result 
   */
  async cancel(create_result) {
    await this.stripe.paymentIntents.cancel(
      create_result.id, 
      { 
        cancellation_reason: 'abandoned'
      }
    );
    
    return this.status(create_result);
  }  

  /**
   * @description todo: logic for if user wanted capture at approval
   * 
   * @param {CheckoutCreateResult} create_result 
   */
  async capture(create_result) {
    await this.stripe.paymentIntents.capture(
      create_result.id, 
      { 
        amount_to_capture: create_result.amount
      }
    );
    
    return this.status(create_result);
  }    

  /**
   * @description todo: logic for if user wanted capture at approval
   * 
   * @param {CheckoutCreateResult} create_result 
   */
  async refund(create_result) {
    const refund = await this.stripe.refunds.create(
      {
        payment_intent: create_result.id,
        amount: create_result.amount,
      }
    );

    return this.status(create_result);
  }

}

