import { assert } from '../v-api/utils.func.js'
import { App } from '../index.js';

/** @param {any} o */
const is_function = o => {
  return o && (typeof o === 'function');
}


/**
 * 
 * `Get` payment gateway `info` and `config` by it's `handle`
 * 
 * @param {App} app 
 * @param {string} gateway_handle 
 * 
 * @returns {import('../v-api/types.api.js').PaymentGatewayItemGet}
 */
export const get_payment_gateway = (app, gateway_handle) => {
  const pg = app.gateway(gateway_handle);

  assert(
    pg,
    `Payment Gateway with handle=${gateway_handle} not found`
  );

  return {
    config: pg.config,
    info: pg.info,
    handle: gateway_handle, 
    actions: pg.actions
  }
}

/**
 * 
 * `List` payment gateways with `config` and `info` 
 * 
 * @param {App} app 
 * 
 * 
 * @returns {import('../v-api/types.api.js').PaymentGatewayItemGet[]}
 */
export const list_payment_gateways = (app) => {
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
 * @description return the `status` of payment of an order
 * 
 * 
 * @template PlatformNativeRequest
 * @template PlatformContext
 * 
 * 
 * @param {import("../types.public.js").App<PlatformNativeRequest, PlatformContext>} app
 * @param {string} order_id the ID of the order
 * 
 */
export const payment_status_of_order = async (app, order_id) => {
  const order = await app.api.orders.get(order_id);

  assert(order, `Order ${order_id} not found`, 400);

  const gateway_handle = order.payment_gateway?.gateway_handle;
  const gateway = app.gateway(gateway_handle);

  assert(gateway, `gateway ${gateway_handle} not found`, 400);

  const r = await gateway.status(
    order?.payment_gateway?.on_checkout_create
  );
  return r;
}

/**
 * @description return the `html` ui of payment of an order after
 * a `checkout` was created
 * 
 * 
 * @template PlatformNativeRequest
 * @template PlatformContext
 * 
 * 
 * @param {import("../types.public.js").App<PlatformNativeRequest, PlatformContext>} app
 * @param {string} order_id the ID of the order
 * 
 */
export const payment_buy_ui = async (app, order_id) => {
  const order = await app.api.orders.get(order_id);

  assert(order, `Order ${order_id} not found`, 400);

  const gateway_handle = order.payment_gateway?.gateway_handle;
  const gateway = app.gateway(gateway_handle);

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
 * Invoke a payment action (`capture`/`void`/`refund`/`whatever`) on 
 * the payment gateway of the order.
 * 
 * 
 * @template PlatformNativeRequest
 * @template PlatformContext
 * 
 * 
 * @param {App<PlatformNativeRequest, PlatformContext>} app `storecraft` app
 * @param {string} order_id the `id` of the order
 * @param {string} action_handle the payment action of the 
 * gateway (o.e `capture`/`void`/`refund`/`whatever`)
 * @param {any} [extra_action_parameters] extra `action` parameters
 * 
 */
export const invoke_payment_action_on_order = async (
  app, order_id, action_handle, extra_action_parameters
) => {

  console.log('action_handle ', action_handle)
  const order = await app.api.orders.get(order_id);

  assert(order, `Order ${order_id} not found`, 400);

  const gateway_handle = order.payment_gateway?.gateway_handle;
  const gateway = app.gateway(gateway_handle);

  assert(gateway, `gateway ${gateway_handle} not found`, 400);

  // test action is a published action by the gateway
  const is_allowed = gateway.actions?.some(a => a?.handle===action_handle) && 
                     is_function(gateway[action_handle]);

  assert(
    is_allowed, 
    `Action ${action_handle} is not supported by gateway ${gateway_handle}`, 
    400
  );

  return gateway.invokeAction(action_handle)(
    order?.payment_gateway?.on_checkout_create, extra_action_parameters
  );
}
