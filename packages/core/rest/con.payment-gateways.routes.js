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
      const r = await app.api.payments.get(
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
      res.end();
    }
  );

  // list payment gateways
  polka.get(
    '/gateways',
    authorize_admin(app),
    async (req, res) => {
      const r = await app.api.payments.list_all();
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
      console.log({ hello: 'world' })
      const { order_id } = req.params;
      const r = await app.api.payments.buy_ui(
        order_id
      );
      res.sendHtml(r);
    }
  );

  return polka;
}
