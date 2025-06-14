/** @import { ApiPolka } from './types.public.js' */
import { Polka } from './polka/index.js'
import { assert } from '../api/utils.func.js'
import { parse_auth_user, is_admin } from './con.auth.middle.js'
import { App } from '../index.js';

/**
 * @param {App} app
 */
export const create_routes = (app) => {

  /** @type {ApiPolka} */
  const polka = new Polka();

  polka.use(parse_auth_user(app));

  // create checkout
  polka.post(
    '/create',
    async (req, res) => {
      const gateway_handle = req.query?.get('gateway');

      assert(
        app.__show_me_everything.gateways?.[gateway_handle], 
        `gateway ${gateway_handle} not found`, 400
      );

      const r = await app.api.checkout.create_checkout(
        req.parsedBody, gateway_handle
      );

      res.sendJson(r);
    }
  );


  // complete a checkout, this is optional if you use web-hooks
  polka.post(
    '/:checkout_id/complete',
    async (req, res) => {
      const checkout_id = req?.params?.checkout_id;

      const r = await app.api.checkout.complete_checkout(
        checkout_id, req.parsedBody
      );

      res.sendJson(r);
    }
  );

  // find a pricing of order
  polka.post(
    '/pricing',
    async (req, res) => {
      const r = await app.api.checkout.validation_and_pricing(
        req.parsedBody
      );
      res.sendJson(r);
    }
  );

  return polka;
}

