import { Polka } from '../v-polka/index.js'
import { assert } from '../v-api/utils.func.js'
import { authorize_admin } from './con.auth.middle.js'
import { get } from '../v-api/con.orders.logic.js'

/** @param {any} o */
const is_function = o => {
  return o && (typeof o === 'function');
}

/**
 * 
 * @template PlatformNativeRequest
 * @template PlatformContext
 * @param {import("../types.public.js").App<PlatformNativeRequest, PlatformContext>} app
 */
export const create_routes = (app) => {

  /** @type {import('../types.public.js').ApiPolka} */
  const polka = new Polka();

  // admin only
  polka.use(authorize_admin(app));

  // get payment status of an order
  polka.get(
    '/:gateway_handle/status/:order_id',
    async (req, res) => {
      const { gateway_handle, order_id } = req.params;
      const order = await get(app, order_id);
      const gateway = app.gateway(gateway_handle);

      assert(order, `Order ${order_id} not found`, 400);
      assert(gateway, `gateway ${gateway_handle} not found`, 400);
      assert(
        order.payment_gateway.gateway_handle===gateway_handle, 
        `order \`${order_id}\` checkout was not initiated by gateway ${gateway_handle}`, 400
      );

      const r = await gateway.status(order?.payment_gateway?.on_checkout_create);
      res.sendJson(r);
    }
  );

  // invoke action api on gateway
  polka.post(
    '/:gateway_handle/:action_handle/:order_id',
    async (req, res) => {
      const { gateway_handle, action_handle, order_id } = req.params;
      const order = await get(app, order_id);
      const gateway = app.gateway(gateway_handle);

      assert(order, `Order ${order_id} not found`, 400);
      assert(gateway, `gateway ${gateway_handle} not found`, 400);
      assert(
        order.payment_gateway.gateway_handle===gateway_handle, 
        `order \`${order_id}\` checkout was not initiated by gateway ${gateway_handle}`, 
        400
      );

      // test actionn is a published action by the gateway
      const is_allowed = gateway.actions?.some(a => a?.handle===action_handle) && 
                         is_function(gateway[action_handle]);
      assert(is_allowed, `Action ${action_handle} is not supported by gateway ${gateway_handle}`, 400)

      /** @type {import('../types.payments.js').PaymentGatewayStatus} */
      const r = await gateway[action_handle](order?.payment_gateway?.on_checkout_create);
      res.sendJson(r);
    }
  );

  return polka;
}

