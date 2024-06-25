import { assert, ID } from '@storecraft/core/v-api/utils.func.js';
import type { payment_gateway } from '@storecraft/core/v-payments';
import { OrderData, PaymentGatewayStatus } from '@storecraft/core/v-api';
import { enums } from '@storecraft/core/v-api';
  
type Config = {
  default_currency_code?: string;
  intent_on_checkout?: 'AUTHORIZE' | 'CAPTURE';
}

type DummyPaymentData = {
  status: 'created' | 'authorized' | 'captured' | 'voided' | 'refunded' | 'unknown';
  id: string;
  created_at: string;
  currency?: string;
  price: number;
}

type CheckoutCreateResult = string;


export class DummyPayments implements payment_gateway<Config, string> {
  
  #_config: Config;
  #_db: Map<string, DummyPaymentData>;

  constructor(config: Config) {
    this.#_config = this.#validate_and_resolve_config(config);
    this.#_db = new Map();
  }

  #validate_and_resolve_config(config: Config) {
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

  invokeAction(action_handle: string) {
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

  get db() {
    return this.#_db;
  }

  async onCheckoutCreate(order: OrderData) { 
    const { default_currency_code: currency_code, intent_on_checkout } = this.config; 
    const id = ID('dummypay');

    this.db.set(
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

  async retrieve_gateway_order(id) {
    const result = this.db.get(id);

    assert(
      result,
      `transaction \`${id}\` was not found !!!`
    );

    return result;
  }

  async onCheckoutComplete(create_result: CheckoutCreateResult) {
    const payment = await this.retrieve_gateway_order(create_result);

    if(!payment)
      throw new Error(`payment with ID=${create_result} was not found !!!`);

    if(payment.status!=='created')
      throw new Error(`payment with ID=${create_result} is not in a good state !!!`);

    this.db.set(
      payment.id,
      {
        ...payment,
        status: this.config.intent_on_checkout==='AUTHORIZE' ? 'authorized' : 'captured',
      }
    );

    return {
      payment: this.config.intent_on_checkout==='AUTHORIZE' ? 
          enums.PaymentOptionsEnum.authorized : enums.PaymentOptionsEnum.captured,

      checkout: enums.CheckoutStatusEnum.complete
    }
  }

  
  async status(create_result: CheckoutCreateResult) {
    const order = await this.retrieve_gateway_order(create_result);
    
    if(!order)
      throw new Error(`payment with ID=${create_result} not found !!!`)

    const stat: PaymentGatewayStatus = {
      messages: [],
      actions: this.actions
    }

    stat.messages = [
      `**${order.price}${order.currency}** transaction was initiated at \`${new Date(order.created_at).toLocaleDateString()}\``,
      order.status==='authorized' && `Order was \`authorized\``,
      order.status==='captured' && `Order was \`captured\``,
      order.status==='refunded' && `Order was \`Refunded\``,
      order.status==='voided' && `Order was \`Voided\``,
    ].filter(Boolean).map(String)
    
    return stat;
  }

  // actions

  async void(create_result: CheckoutCreateResult) {
    const order = await this.retrieve_gateway_order(create_result);

    if(!order)
      throw new Error();

    assert(
      order.status==='authorized' || order.status==='created',
      `Cannot void`
    );

    this.db.set(
      create_result, 
      {
        ...order,
        status: 'voided'
      }
    );
    
    return this.status(create_result);
  }  

  async capture(create_result: CheckoutCreateResult) {
    const order = await this.retrieve_gateway_order(create_result);

    if(!order)
      throw new Error();

    assert(
      order.status==='authorized',
      `**un-authorized** transaction cannot be **captured**`
    );

    this.db.set(
      create_result, 
      {
        ...order,
        status: 'captured'
      }
    );
    
    return this.status(create_result);
  }    

  async refund(create_result: CheckoutCreateResult) {
    const order = await this.retrieve_gateway_order(create_result);

    if(!order)
      throw new Error();

    assert(
      order.status==='captured',
      `**un-captured** transaction cannot be **refunded**`
    );

    this.db.set(
      create_result, 
      {
        ...order,
        status: 'refunded'
      }
    );
    
    return this.status(create_result);
  }

}

