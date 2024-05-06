import { Polka } from '../v-polka/index.js'
import { assert } from '../v-api/utils.func.js'
import { parse_auth_user, is_admin } from './con.auth.middle.js'

/**
 * 
 * @template PlatformNativeRequest
 * @template PlatformContext
 * 
 * @param {import("../types.public.js").App<
 *  PlatformNativeRequest, PlatformContext
 * >} app
 */
export const create_routes = (app) => {

  /** @type {import('../types.public.js').ApiPolka} */
  const polka = new Polka();

  polka.use(parse_auth_user(app));

  // create checkout
  polka.post(
    '/create',
    async (req, res) => {
      const gateway_handle = req.query?.get('gateway');

      assert(
        app.gateway(gateway_handle), 
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
      const r = await app.api.checkout.eval_pricing(req.parsedBody);

      res.sendJson(r.pricing);
    }
  );

  return polka;
}

