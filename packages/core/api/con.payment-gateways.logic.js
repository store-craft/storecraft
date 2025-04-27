/**
 * @import { PaymentGatewayItemGet } from '../api/types.api.js';
 * @import { ApiRequest, ApiResponse } from '../rest/types.public.js';
 */

import { assert } from '../api/utils.func.js'
import { App } from '../index.js';

/** @param {any} o */
const is_function = o => {
  return o && (typeof o === 'function');
}


/**
 * @template {App} T
 * @param {T} app
 */
export const get_payment_gateway = (app) => 
  /**
   * @description `Get` payment gateway `info` and `config` by it's `handle`
   * @param {keyof T["gateways"]} gateway_handle 
   * @returns {Promise<PaymentGatewayItemGet>}
   */
  async (gateway_handle) => {
    
    const handle = /** @type {string} */(gateway_handle);
    const pg = app.gateways?.[handle];

    assert(
      pg,
      `Payment Gateway with handle=${handle} not found`
    );

    return {
      config: pg.config,
      info: pg.info,
      handle: handle, 
      actions: pg.actions
    }
  }

/**
 * @param {App} app 
 */
export const list_payment_gateways = (app) => 
  /**
   * `List` payment gateways with `config` and `info` 
   * @returns {Promise<PaymentGatewayItemGet[]>}
   */
  async () => {
  return Object.entries(app.gateways ?? {}).map(
    ([handle, pg]) => (
      {
        config: pg.config,
        info: pg.info,
        handle: handle,
        actions: pg.actions
      }
    )
  )
}

/**
 * @template {App} T
 * @param {T} app
 */
export const webhook = (app) => 
  /**
   * @description `Get` payment gateway `info` and `config` by it's `handle`
   * @param {keyof T["gateways"]} gateway_handle 
   * @param {ApiRequest} request
   * @param {ApiResponse} [response]
   */
  async (gateway_handle, request, response) => {
    const handle = /** @type {string} */(gateway_handle);
    const pg = app.gateways?.[handle];

    assert(
      pg,
      `Payment Gateway with handle=${handle} not found`
    );

    assert(
      pg.webhook,
      `Payment Gateway with handle=${handle} does not have a webhook handler`
    );

    const { status, order_id } = await pg.webhook(
      request, response
    );

    { // set the side-effects lazily, so the webhook response will be sent quick
      
      if(order_id && status) {
        const order = await app.api.orders.get(order_id);
        await app.api.orders.upsert(
          {
            ...order,
            status: {
              ...order?.status,
              payment: status.payment,
              checkout: status.checkout
            }
          }
        );
      }
    }
  }


/**
 * @param {App} app
 */
export const payment_status_of_order = (app) => 
  /**
   * @description return the `status` of payment of an order
   * @param {string} order_id the ID of the order
   */
  async (order_id) => {
    const order = await app.api.orders.get(order_id);

    assert(order, `Order ${order_id} not found`, 400);

    const gateway_handle = order.payment_gateway?.gateway_handle;
    const gateway = app.gateways?.[gateway_handle];

    assert(gateway, `gateway ${gateway_handle} not found`, 400);

    const r = await gateway.status(
      order?.payment_gateway?.on_checkout_create
    );
    return r;
  }

/**
 * @param {App} app
 */
export const payment_buy_ui = (app) => 
  /**
   * @description return the `html` ui of payment of an order after
   * a `checkout` was created
   * @param {string} order_id the ID of the order
   * @returns {Promise<string>} `html` of the payment gateway UI
   */
  async (order_id) => {
    const order = await app.api.orders.get(order_id);

    assert(order, `Order ${order_id} not found`, 400);

    const gateway_handle = order.payment_gateway?.gateway_handle;
    const gateway = app.gateways?.[gateway_handle];

    assert(gateway, `gateway ${gateway_handle} not found`, 400);
    assert(
      'onBuyLinkHtml' in gateway, 
      `gateway ${gateway_handle} does not support buy UI`, 
      400
    );

    const r = await gateway.onBuyLinkHtml(
      order
    );

    return r;
  }

/**
 * @template {App} T
 * @param {T} app
 */
export const invoke_payment_action_on_order = (app) => 
  /**
   * @description Invoke a payment action (`capture`/`void`/`refund`/`whatever`) on 
   * the payment gateway of the order.
   * 
   * @param {string} order_id the `id` of the order
   * @param {string} action_handle the payment action of the 
   * gateway (o.e `capture`/`void`/`refund`/`whatever`)
   * @param {any} [extra_action_parameters] extra `action` parameters
   */
  async (
    order_id, action_handle, extra_action_parameters
  ) => {

    const order = await app.api.orders.get(order_id);

    assert(order, `Order ${order_id} not found`, 400);

    const gateway_handle = order.payment_gateway?.gateway_handle;
    const gateway = app.gateways?.[gateway_handle];

    assert(gateway, `gateway ${gateway_handle} not found`, 400);

    // test action is a published action by the gateway
    const is_allowed = gateway.actions?.some(a => a?.handle===action_handle);

    assert(
      is_allowed, 
      `Action ${action_handle} is not supported by gateway ${gateway_handle}`, 
      400
    );

    return gateway.invokeAction(action_handle)(
      order?.payment_gateway?.on_checkout_create, 
      extra_action_parameters
    );
  }


/**
 * @template {App} T
 * @param {T} app
 */  
export const inter = app => {

  return {
    get: get_payment_gateway(app),
    list_all: list_payment_gateways(app),
    webhook: webhook(app),
    status_of_order: payment_status_of_order(app),
    buy_ui: payment_buy_ui(app),
    invoke_action: invoke_payment_action_on_order(app),
  }
}