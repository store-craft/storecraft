import { assert } from '../v-api/utils.func.js'
import { get } from '../v-api/con.orders.logic.js'

/** @param {any} o */
const is_function = o => {
  return o && (typeof o === 'function');
}

/**
 * return the status of payment of an order
 * @template PlatformNativeRequest
 * @template PlatformContext
 * @param {import("../types.public.js").App<PlatformNativeRequest, PlatformContext>} app
 * @param {string} order_id the ID of the order
 */
export const payment_status_of_order = async (app, order_id) => {
  const order = await get(app, order_id);
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
 * invoke a payment action (capture/void/refund/whatever) on the payment gateway
 * of the order.
 * @template PlatformNativeRequest
 * @template PlatformContext
 * @param {import("../types.public.js").App<PlatformNativeRequest, PlatformContext>} app
 * @param {string} order_id the ID of the order
 * @param {string} action_handle the payment action of the gateway (o.e capture/void/refund)
 */
export const invoke_payment_action_on_order = async (app, order_id, action_handle) => {
  const order = await get(app, order_id);
  assert(order, `Order ${order_id} not found`, 400);
  const gateway_handle = order.payment_gateway?.gateway_handle;
  const gateway = app.gateway(gateway_handle);
  assert(gateway, `gateway ${gateway_handle} not found`, 400);

  // test actionn is a published action by the gateway
  const is_allowed = gateway.actions?.some(a => a?.handle===action_handle) && 
                     is_function(gateway[action_handle]);
  assert(
    is_allowed, 
    `Action ${action_handle} is not supported by gateway ${gateway_handle}`, 
    400
  );

  /** @type {import('./types.payments.js').PaymentGatewayStatus} */
  return gateway[action_handle](order?.payment_gateway?.on_checkout_create);
}
