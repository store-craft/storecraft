/**
 * @import { Config } from './types.public.js'
 * @import { ENV } from '@storecraft/core';
 * @import { OrderData, PaymentGatewayStatus } from '@storecraft/core/api'
 * @import { payment_gateway } from '@storecraft/core/payments'
 * @import { ApiRequest, ApiResponse } from '@storecraft/core/rest'
 * @import { } from './types.private.js'
 */

import { 
  CheckoutStatusEnum, PaymentOptionsEnum 
} from '@storecraft/core/api/types.api.enums.js';
import { StorecraftError } from '@storecraft/core/api/utils.func.js';
import html_buy_ui from './adapter.html.js';
import { Stripe as StripeCls } from 'stripe'

/**
 * @typedef {StripeCls.Response<StripeCls.PaymentIntent>} CheckoutCreateResult
 * @typedef {payment_gateway<Config, CheckoutCreateResult>} Impl
 */

/**
 * @description in a {@link StripeCls.PaymentIntent}, is a `metadata` key-value
 * storage where we store the `order_id` of the `storecraft` order.
 */
export const metadata_storecraft_order_id = 'storecraft_order_id'

/**
 * @implements {Impl}
 * 
 * @description **Stripe** gateway (https://docs.stripe.com/payments/place-a-hold-on-a-payment-method)
 */
export class Stripe {
  
  /** @satisfies {ENV<Config>} */
  static EnvConfig = /** @type {const} */ ({
    publishable_key: 'STRIPE_PUBLISHABLE_KEY',
    secret_key: 'STRIPE_SECRET_KEY',
    webhook_endpoint_secret: 'STRIPE_WEBHOOK_SECRET',
  });

  /** @type {Config} */ #_config;
  /** @type {StripeCls} */ #stripe;

  /**
   * 
   * @param {Config} config 
   */
  constructor(config={}) {
    this.#_config = {
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
    };
  }

  /** @type {Impl["onInit"]} */
  onInit = (app) => {
    this.config.publishable_key ??=
      app.env[Stripe.EnvConfig.publishable_key];
    this.config.secret_key ??= 
      app.env[Stripe.EnvConfig.secret_key];
    this.config.webhook_endpoint_secret ??= 
      app.env[Stripe.EnvConfig.webhook_endpoint_secret];
  }

  get stripe() {
    const is_valid = this.config.publishable_key && 
      this.config.secret_key;

    if(!is_valid) {
      throw new StorecraftError(
        `Payment gateway ${this.info.name ?? 'unknown'} has invalid config !!! 
        Missing client_id or secret`
      )
    }

    this.#stripe = this.#stripe ?? new StripeCls(
      this.config.secret_key, this.config.stripe_config ?? {}
    );

    return this.#stripe;
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
   * @type {Impl["invokeAction"]}
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
   * @type {Impl["onBuyLinkHtml"]}
   */
  async onBuyLinkHtml(order) {

    return html_buy_ui(
      this.config, order
    )
  }

  /**
   * @description on checkout create `hook`
   * 
   * @type {Impl["onCheckoutCreate"]}
   */
  async onCheckoutCreate(order) {

    const paymentIntent = await this.stripe.paymentIntents.create(
      {
        amount: Math.floor(order.pricing.total * 100),
        ...this.config.stripe_intent_create_params,
        metadata: {
          [metadata_storecraft_order_id]: order.id
        }
      }
    );

    return paymentIntent;
  }

  /**
   * @description On checkout complete hook. With stripe, this corresponds
   * to synchronous payments flows, which is discouraged by `stripe`.
   * They advocate async flows where confirmation happens async from
   * client side into their servers, and then you are notified via a
   * webhook.
   * 
   * @type {Impl["onCheckoutComplete"]}  
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
   * @type {Impl["status"]}
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
      const date = new Date(o.created*1000).toUTCString();
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
   * @description [https://docs.stripe.com/webhooks](https://docs.stripe.com/webhooks)
   * @type {Impl["webhook"]}
   */
  async webhook(request, response) {
    const sig = request.headers.get('Stripe-Signature');

    let event;
  
    event = await this.stripe.webhooks.constructEventAsync(
      request.rawBody, sig, this.config.webhook_endpoint_secret, undefined,
      StripeCls.createSubtleCryptoProvider()
    );

    /** @type {string} */
    let order_id = undefined;

    /** @type {PaymentOptionsEnum[keyof PaymentOptionsEnum]} */
    let payment_status = PaymentOptionsEnum.unpaid;
    
    // Handle the event
    switch (event?.type) {
      case 'payment_intent.succeeded':
      case 'payment_intent.payment_failed':
      case 'payment_intent.requires_action':
      case 'payment_intent.amount_capturable_updated':
      case 'payment_intent.canceled': {
        const payment_intent = event.data.object;
        order_id = payment_intent.metadata[metadata_storecraft_order_id];

        if(payment_intent.status==='requires_capture')
          payment_status = PaymentOptionsEnum.authorized;
        else if(payment_intent.status==='canceled')
          payment_status = PaymentOptionsEnum.unpaid;
        else if(payment_intent.status==='processing')
          payment_status = PaymentOptionsEnum.unpaid;
        else if(payment_intent.status==='requires_action')
          payment_status = PaymentOptionsEnum.unpaid;
        else if(payment_intent.status==='succeeded')
          payment_status = PaymentOptionsEnum.captured;
        break;
      }
      case 'charge.refunded':
      case 'charge.refund.updated':
        const payment_intent = event.data.object;
        order_id = payment_intent.metadata[metadata_storecraft_order_id];
        payment_status = PaymentOptionsEnum.refunded;
        break;
      default: {
        console.log(`Stripe:: We don't handle event of type ${event.type}`);

        return undefined;
      }
    }

    if(!order_id) {
      throw new Error(
        `No 'storecraft' 'order_id' found in metadata for event type ${event.type}`
      )
    }
  
    // Return a response to acknowledge receipt of the event
    response.sendJson({received: true});    

    return {
      order_id,
      status: {
        payment: payment_status,
        checkout: CheckoutStatusEnum.complete
      }
    }
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

