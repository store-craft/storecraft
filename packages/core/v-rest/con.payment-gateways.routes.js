import { Polka } from '../v-polka/index.js'
import { authorize_admin } from './con.auth.middle.js'
import { 
  get_payment_gateway, invoke_payment_action_on_order, 
  list_payment_gateways, payment_buy_ui, payment_status_of_order, 
  webhook
} from '../v-payments/con.payment-gateways.logic.js'
import { assert } from '../v-api/utils.func.js';


/**
 * 
 * @template PlatformNativeRequest
 * @template PlatformContext
 * 
 * @param {import("../types.public.js").App<
 *  PlatformNativeRequest, PlatformContext
 * >} app
 * 
 */
export const create_routes = (app) => {

  /** @type {import('../types.public.js').ApiPolka} */
  const polka = new Polka();

  // get payment gateway
  polka.get(
    '/gateways/:gateway_handle',
    authorize_admin(app),
    async (req, res) => {
      const { gateway_handle } = req.params;
      const r = get_payment_gateway(
        app, gateway_handle
      );
      res.sendJson(r);
    }
  );

  polka.post(
    '/gateways/:gateway_handle/webhook',
    async (req, res) => {
      const { gateway_handle } = req.params;
      const r = await webhook(
        app, gateway_handle, req, res
      );

      // We expect the webhook handler in the gateway to finish the
      // response, but in case it didn't, we will error it.
      assert(
        res.finished,
        `webhook for gateway ${gateway_handle} did not send a response`
      );

    }
  );

  // list payment gateways
  polka.get(
    '/gateways',
    authorize_admin(app),
    async (req, res) => {
      const r = list_payment_gateways(
        app
      );
      res.sendJson(r);
    }
  );


  // get payment status of an order
  polka.get(
    '/status/:order_id',
    authorize_admin(app),
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
    authorize_admin(app),
    async (req, res) => {
      const { action_handle, order_id } = req.params;
      const r = await invoke_payment_action_on_order(
        app, order_id, action_handle, req.parsedBody
      );
      
      res.sendJson(r);
    }
  );
  
  polka.get(
    '/buy_ui/:order_id',
    async (req, res) => {
      const { order_id } = req.params;
      const r = await payment_buy_ui(
        app, order_id
      );
      
      res.sendHtml(r);
    }
  );

  return polka;
}

