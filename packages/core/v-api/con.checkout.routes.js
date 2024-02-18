import { Polka } from '../v-polka/index.js'
import { assert } from './utils.func.js'
import { parse_auth_user, is_admin } from './con.auth.middle.js'
import { complete_checkout, create_checkout, eval_pricing } from './con.checkout.logic.js'

/**
 * 
 * @template PlatformNativeRequest
 * @template PlatformContext
 * @param {import("../types.public.js").App<PlatformNativeRequest, PlatformContext>} app
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
      assert(app.gateway(gateway_handle), `gateway ${gateway_handle} not found`, 400);
      const r = await create_checkout(app, req.parsedBody, gateway_handle);
      if(!is_admin(req.user)) {
        delete r?.payment_gateway?.on_checkout_create;
      }
      res.sendJson(r);
    }
  );

  // complete a checkout, this is optional if you use web-hooks
  polka.post(
    '/:checkout_id/complete',
    async (req, res) => {
      const checkout_id = req?.params?.checkout_id;
      const r = await complete_checkout(app, checkout_id);
      if(!is_admin(req.user)) {
        delete r?.payment_gateway?.on_checkout_create;
      }
      res.sendJson(r);
    }
  );

  // find a pricing of order
  polka.post(
    '/pricing',
    async (req, res) => {
      const r = await eval_pricing(app, req.parsedBody);
      if(!is_admin(req.user)) {
        delete r?.payment_gateway?.on_checkout_create;
      }
      res.sendJson(r);
    }
  );

  return polka;
}

