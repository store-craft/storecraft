import { Polka } from '../v-polka/index.js'
import { authorize_admin } from './con.auth.middle.js'
import { invoke_payment_action_on_order, 
  payment_status_of_order } from '../v-payments/con.payment-gateways.logic.js'

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
    '/status/:order_id',
    async (req, res) => {
      const { order_id } = req.params;
      const r = await payment_status_of_order(
        app, order_id
      );
      res.sendJson(r);
    }
  );

  // invoke action api on gateway
  polka.post(
    '/:action_handle/:order_id',
    async (req, res) => {
      const { action_handle, order_id } = req.params;
      const r = await invoke_payment_action_on_order(
        app, order_id, action_handle
      );
      res.sendJson(r);
    }
  );

  return polka;
}

