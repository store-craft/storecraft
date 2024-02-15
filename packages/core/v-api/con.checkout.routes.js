import { Polka } from '../v-polka/index.js'
import { assert } from './utils.func.js'
import { authorize_by_roles } from './con.auth.middle.js'
import { complete_checkout, create_checkout } from './con.checkout.logic.js'

/**
 * 
 * @template PlatformNativeRequest
 * @template PlatformContext
 * @param {import("../types.public.js").App<PlatformNativeRequest, PlatformContext>} app
 */
export const create_routes = (app) => {

  /** @type {import('../types.public.js').ApiPolka} */
  const polka = new Polka();

  // create checkout
  polka.post(
    '/create',
    async (req, res) => {
      const r = await create_checkout(app, req.parsedBody)
      res.sendJson(r);
    }
  );

  // complete a checkout, this is optional if you use web-hooks
  polka.post(
    '/:checkout_id/complete',
    async (req, res) => {
      const handle_or_id = req?.params?.handle;
      const r = await complete_checkout(app, handle_or_id);
      res.sendJson(r);
    }
  );

  return polka;
}

