import { 
  CheckoutStatusEnum, PaymentOptionsEnum 
} from '@storecraft/core/v-api/types.api.enums.js';
import { assert, ID } from '@storecraft/core/v-api/utils.func.js';
import { DummyDatabase } from './dummy-database.js';
  

/**
 * @typedef {object} DummyPaymentData
 * @prop {'created' | 'authorized' | 'captured' | 'voided' | 'refunded' | 'unknown'} status
 * @prop {string} id
 * @prop {string} created_at
 * @prop {number} price
 * @prop {string} currency
 */

/**
 * 
 * @typedef {string} CreateResult
 * @typedef {import('@storecraft/core/v-api').CheckoutStatusEnum} CheckoutStatusOptions
 * @typedef {import('@storecraft/core/v-api').OrderData} OrderData
 * @typedef {import('./types.public.js').Config} Config
 * @typedef {import('@storecraft/core/v-payments').payment_gateway<Config, CreateResult>} payment_gateway
 */

/** 
 * @description `Dummy payment gateway`, used for:
 * - testing purposes
 * - playground and shaping new features
 * 
 * @implements {payment_gateway}
 */
export class DummyPayments {
  
  /** @type {Config} */ #_config;

  /**
   * @type {DummyDatabase<DummyPaymentData>}
   */
  #_db;

  /**
   * 
   * @param {Config} config 
   */
  constructor(config) {
    this.#_config = this.#validate_and_resolve_config(config);
    this.#_db = new DummyDatabase();
  }

  /**
   * 
   * @param {Config} config 
   */
  #validate_and_resolve_config(config) {
    config = {
      default_currency_code: 'USD',
      intent_on_checkout: 'AUTHORIZE',
      ...config
    }

    return config;
  }

  get info() {
    return {
      name: 'Dummy payments',
      description: 'This is a `dummy` payment processor for playgorund purposes',
      url: 'https://storecraft.dev',
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
   * @type {payment_gateway["invokeAction"]}
   */
  async invokeAction(action_handle) {
    switch (action_handle) {
      case 'capture':
        return this.capture;
      case 'void':
        return this.void;
      case 'refund':
        return this.refund;
    
      default:
        break;
    }
  }

  get db() {
    return this.#_db;
  }

  /**
   * 
   * @param {OrderData} order 
   * 
   * @return {Promise<CreateResult>}
   */
  async onCheckoutCreate(order) { 
    const { default_currency_code: currency_code, intent_on_checkout } = this.config; 
    const id = ID('dummypay');

    await this.db.set(
      id,
      {
        status: 'created',
        id,
        created_at: (new Date()).toISOString(),
        price: order.pricing.total,
        currency: currency_code
      }
    );

    return id;
  }

  /**
   * 
   * @param {string} id 
   */
  async retrieve_gateway_order(id) {
    const result = await this.db.get(id);

    assert(
      result,
      `transaction ${id} was not found !!!`
    );

    return result;
  }


  /**
   * 
   * @param {CreateResult} create_result 
   * 
   * @return {ReturnType<payment_gateway["onCheckoutComplete"]>} create_result 
   */
  async onCheckoutComplete(create_result) {
    const payment = await this.retrieve_gateway_order(create_result);

    assert(
      payment,
      `payment with ID=${create_result} was not found !!!`
    );

    assert(
      payment.status==='created',
      `payment with ID=${create_result} is not in a good state !!!`
    );

    return {
      payment: this.config.intent_on_checkout==='AUTHORIZE' ? 
            PaymentOptionsEnum.authorized : PaymentOptionsEnum.captured,
      checkout: CheckoutStatusEnum.complete
    }
  }

  /**
   * Fetch the order and analyze it's status
   * 
   * 
   * @param {CreateResult} create_result 
   * 
   * 
   * @returns {Promise<import('@storecraft/core/v-api').PaymentGatewayStatus>}
   */
  async status(create_result) {
    const order = await this.retrieve_gateway_order(create_result);
    
    /** @type {import('@storecraft/core/v-api').PaymentGatewayStatus} */
    const stat = {
      messages: [],
      actions: this.actions
    }

    stat.messages = [
      `**${order.price}${order.currency}** transaction was initiated at \`${new Date(order.created_at).toLocaleDateString()}\``,
      order.status==='authorized' && `Order was \`authorized\``,
      order.status==='captured' && `Order was \`captured\``,
      order.status==='refunded' && `Order was \`Refunded\``,
      order.status==='voided' && `Order was \`Voided\``,
    ].filter(Boolean)
    
    return stat;
  }

  /**
   * 
   * @param {Request} request 
   */
  async webhook(request) {
    return null;
  }

  
  // actions

  /**
   * todo: logic for if user wanted capture at approval
   * 
   * @param {CreateResult} create_result 
   */
  async void(create_result) {
    const order = await this.retrieve_gateway_order(create_result);

    if(order.status==='authorized' || order.status==='created') {
      await this.db.set(
        create_result, 
        {
          ...order,
          status: 'voided'
        }
      );
    }
    
    return this.status(create_result);
  }  

  /**
   * todo: logic for if user wanted capture at approval
   * @param {CreateResult} create_result 
   */
  async capture(create_result) {
    const order = await this.retrieve_gateway_order(create_result);

    if(order.status==='authorized') {
      await this.db.set(
        create_result, 
        {
          ...order,
          status: 'captured'
        }
      );
    }
    
    return this.status(create_result);
  }    

  /**
   * todo: logic for if user wanted capture at approval
   * @param {CreateResult} create_result 
   */
  async refund(create_result) {
    const order = await this.retrieve_gateway_order(create_result);

    if(order.status==='captured') {
      await this.db.set(
        create_result, 
        {
          ...order,
          status: 'refunded'
        }
      );
    }
    
    return this.status(create_result);
  }

}

