/** @import { ApiPolka } from './types.public.js' */
import { App } from '../index.js';
import { Polka } from './polka/index.js'
import { authorize_admin } from './con.auth.middle.js'
import { assert } from '../api/utils.func.js';


/**
 * @param {App} app
 */
export const create_routes = (app) => {

  /** @type {ApiPolka} */
  const polka = new Polka();

  // get payment gateway
  polka.get(
    '/gateways/:gateway_handle',
    authorize_admin(app),
    async (req, res) => {
      const { gateway_handle } = req.params;
      const r = app.api.payments.get(
        gateway_handle
      );
      res.sendJson(r);
    }
  );

  polka.post(
    '/gateways/:gateway_handle/webhook',
    async (req, res) => {
      const { gateway_handle } = req.params;
      const r = await app.api.payments.webhook(
        gateway_handle, req, res
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
      const r = app.api.payments.list();
      res.sendJson(r);
    }
  );


  // get payment status of an order
  polka.get(
    '/status/:order_id',
    authorize_admin(app),
    async (req, res) => {
      const { order_id } = req.params;
      const r = await app.api.payments.status_of_order(
        order_id
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
      const r = await app.api.payments.invoke_action(
        order_id, action_handle, req.parsedBody
      );
      
      res.sendJson(r);
    }
  );
  
  polka.get(
    '/buy_ui/:order_id',
    async (req, res) => {
      const { order_id } = req.params;
      const r = await app.api.payments.buy_ui(
        order_id
      );
      
      res.sendHtml(r);
    }
  );

  return polka;
}

