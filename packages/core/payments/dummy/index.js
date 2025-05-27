/**
 * @import { OrderData, PaymentGatewayStatus } from '../../api/types.api.js'
 * @import { Config } from './types.public.js'
 * @import { DummyPaymentData } from './types.private.js'
 * @import { payment_gateway } from '../../payments/types.public.js'
 */

import { 
  CheckoutStatusEnum, PaymentOptionsEnum 
} from '@storecraft/core/api/types.api.enums.js';
import { assert, ID } from '@storecraft/core/api/utils.func.js';
import { DummyDatabase } from './dummy-database.js';
  

/**
 * @typedef {string} CreateResult
 * @typedef {payment_gateway<Config, CreateResult>} Impl
 */

/** 
 * @description `Dummy payment gateway`, used for:
 * - testing purposes
 * - playground and shaping new features
 * 
 * @implements {Impl}
 */
export class DummyPayments {
  
  /** @type {Config} */ #_config;

  /**
   * @type {DummyDatabase<DummyPaymentData>}
   */
  #db;

  /**
   * @param {Config} config 
   */
  constructor(config={}) {
    this.#_config = this.#validate_and_resolve_config(config);
    this.#db = new DummyDatabase();

    for(const [key, value] of Object.entries(config?.seed ?? {})) {
      this.#db.set(key, value);
    }

  }

  /**
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

  /** @type {Impl["info"]} */
  get info() {
    return {
      name: 'Dummy payments',
      description: 'This is a dummy payment processor for test purposes',
      url: 'https://storecraft.app',
      logo_url: 'http://storecraft.app/favicon.svg'
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
      {
        handle: 'ping',
        name: 'Ping',
        description: 'Ping for testing'
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
      case 'ping':
        return async (checkout_create_result) => {
          return {
            messages: [
              checkout_create_result
            ]
          }
        }
      
      default:
        break;
    }
  }

  get db() {
    return this.#db;
  }

  /**
   * 
   * @type {Impl["onCheckoutCreate"]}
   */
  async onCheckoutCreate(order) { 
    const { 
      default_currency_code: currency_code, intent_on_checkout 
    } = this.config; 
    const id = ID('dummypay');

    await this.db.set(
      id,
      {
        status: 'created',
        id,
        created_at: (new Date()).toISOString(),
        price: order.pricing.total,
        currency: currency_code,
        metadata: {
          external_order_id: order.id,
        },
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
      `transaction \`${id}\` was not found !!!`
    );

    return result;
  }


  /**
   * 
   * @type {Impl["onCheckoutComplete"]}
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

    /** @type {DummyPaymentData} */
    const updated_entry = {
      ...payment,
      status: this.config.intent_on_checkout==='AUTHORIZE' ? 'authorized' : 'captured',
    }
    
    await this.db.set(
      payment.id,
      updated_entry
    );

    return {
      status: {
        payment: this.config.intent_on_checkout==='AUTHORIZE' ? 
              PaymentOptionsEnum.authorized : PaymentOptionsEnum.captured,
        checkout: CheckoutStatusEnum.complete
      },
      onCheckoutComplete: updated_entry
    }
  }

  /**
   * Fetch the order and analyze it's status
   * @type {Impl["onBuyLinkHtml"]}
   */
  async onBuyLinkHtml(order) {
    return `
<html>
  <head>
    <title>Dummy payment</title>
    <style>
      body {
        width: wvh;
        max-width: 600px;
        margin: auto;
        font-family: Arial, sans-serif;
        background-color: white;
        padding: 10px;
      }
      
      button {
        background: #5469d4;
        font-family: Arial, sans-serif;
        color: #ffffff;
        border-radius: 4px;
        border: 0;
        padding: 12px 16px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        display: block;
        transition: all 0.2s ease;
        box-shadow: 0px 4px 5.5px 0px rgba(0, 0, 0, 0.07);
        width: 100%;
      }

      .hidden {
        display: none;
      }

      /* spinner/processing state, errors */
      .spinner,
      .spinner:before,
      .spinner:after {
        border-radius: 50%;
      }
      .spinner {
        color: #ffffff;
        font-size: 22px;
        text-indent: -99999px;
        margin: 0px auto;
        position: relative;
        width: 20px;
        height: 20px;
        box-shadow: inset 0 0 0 2px;
        -webkit-transform: translateZ(0);
        -ms-transform: translateZ(0);
        transform: translateZ(0);
      }
      .spinner:before,
      .spinner:after {
        position: absolute;
        content: "";
      }
      .spinner:before {
        width: 10.4px;
        height: 20.4px;
        background: #5469d4;
        border-radius: 20.4px 0 0 20.4px;
        top: -0.2px;
        left: -0.2px;
        -webkit-transform-origin: 10.4px 10.2px;
        transform-origin: 10.4px 10.2px;
        -webkit-animation: loading 2s infinite ease 1.5s;
        animation: loading 2s infinite ease 1.5s;
      }
      .spinner:after {
        width: 10.4px;
        height: 10.2px;
        background: #5469d4;
        border-radius: 0 10.2px 10.2px 0;
        top: -0.1px;
        left: 10.2px;
        -webkit-transform-origin: 0px 10.2px;
        transform-origin: 0px 10.2px;
        -webkit-animation: loading 2s infinite ease;
        animation: loading 2s infinite ease;
      }

      @-webkit-keyframes loading {
        0% {
          -webkit-transform: rotate(0deg);
          transform: rotate(0deg);
        }
        100% {
          -webkit-transform: rotate(360deg);
          transform: rotate(360deg);
        }
      }
      @keyframes loading {
        0% {
          -webkit-transform: rotate(0deg);
          transform: rotate(0deg);
        }
        100% {
          -webkit-transform: rotate(360deg);
          transform: rotate(360deg);
        }
      }

    </style>
    </head>
    <body>
    <h1>Dummy payment</h1>
    <p>Dummy payment processor</p>
    <p>Total: <strong>${order.pricing.total}</strong></p>
    <p>Order ID: <strong>${order?.id?.replace('order_', '') ?? 'unknown'}</strong></p>
    <p>Order Status: <strong>${order.status.payment.name}</strong></p>
    <button id="submit" onclick="handlePayment()">
        <div class="spinner hidden" id="spinner"></div>
        <span id="button-text">Pay now</span>
      </button>
    <script>
      const dispatchEvent = (event, data) => {
        window?.parent?.postMessage(
          {
            who: "storecraft",
            event,
            data
          },
          "*"
        );
      }
      // Override console.log to send messages to the parent window
      console.log = function(...args) {
        // Log to console
        dispatchEvent(
          "storecraft/checkout-log",
          args
        );
      };

      console.error = function(...args) {
        // Log to console
        dispatchEvent(
          "storecraft/checkout-error",
          args
        );
      };
              
      // alert('This is a dummy payment processor. Payment will not be processed.');
      // payButton.addEventListener('click', handlePayment);

      async function handlePayment() {
        // find button and add listener
        // Simulate payment processing
        // alert('Payment processing is simulated. This is a dummy payment processor.');
        setLoading(true);
        try {
          const response = await fetch(window.location.origin + "/api/checkout/${order.id}/complete", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });
          if(response.ok) {
            dispatchEvent('storecraft/checkout-complete', {
              order_id: '${order.id}',
            });
          }
          window.location.reload();
        } catch (e) {
          console.error('Error processing payment:', e);
          dispatchEvent('storecraft/checkout-error', {
            error: e.message
          });
        } finally {
          setLoading(false);
        }
      }

      // Show a spinner on payment submission
      function setLoading(isLoading) {
        if (isLoading) {
          // Disable the button and show a spinner
          document.querySelector("#submit").disabled = true;
          document.querySelector("#spinner").classList.remove("hidden");
          document.querySelector("#button-text").classList.add("hidden");
        } else {
          document.querySelector("#submit").disabled = false;
          document.querySelector("#spinner").classList.add("hidden");
          document.querySelector("#button-text").classList.remove("hidden");
        }
      }        
    </script>
  </body>
</html>  
    `
  }


  /**
   * Fetch the order and analyze it's status
   * @type {Impl["webhook"]}
   */
  async webhook(request, response) {
    /** @type {{id: string}} */
    const body = await request.json();
    const transaction_id = body.id;

    assert(
      transaction_id,
      `transaction ID was not found in the request body`
    );

    const payment = await this.retrieve_gateway_order(
      transaction_id
    );

    await this.db.set(
      payment.id, 
      {
        ...payment,
        status: 'captured'
      }
    );
    
    return {
      status: {
        payment: PaymentOptionsEnum.captured,
        checkout: CheckoutStatusEnum.complete
      },
      order_id: payment.metadata.external_order_id
    }
  }
 

  /**
   * Fetch the order and analyze it's status
   * @type {Impl["status"]}
   */
  async status(create_result) {
    const order = await this.retrieve_gateway_order(create_result);
    
    /** @type {PaymentGatewayStatus} */
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

  // actions

  /**
   * todo: logic for if user wanted capture at approval
   * 
   * @param {CreateResult} create_result 
   */
  async void(create_result) {
    const order = await this.retrieve_gateway_order(create_result);

    assert(
      order.status==='authorized' || order.status==='created',
      `Cannot void`
    );

    await this.db.set(
      create_result, 
      {
        ...order,
        status: 'voided'
      }
    );
    
    return this.status(create_result);
  }  

  /**
   * todo: logic for if user wanted capture at approval
   * @param {CreateResult} create_result 
   */
  async capture(create_result) {
    const order = await this.retrieve_gateway_order(create_result);

    assert(
      order.status==='authorized',
      `**un-authorized** transaction cannot be **captured**`
    );

    await this.db.set(
      create_result, 
      {
        ...order,
        status: 'captured'
      }
    );
    
    return this.status(create_result);
  }    

  /**
   * todo: logic for if user wanted capture at approval
   * @param {CreateResult} create_result 
   */
  async refund(create_result) {
    const order = await this.retrieve_gateway_order(create_result);

    assert(
      order.status==='captured',
      `**un-captured** transaction cannot be **refunded**`
    );

    await this.db.set(
      create_result, 
      {
        ...order,
        status: 'refunded'
      }
    );
    
    return this.status(create_result);
  }

}

