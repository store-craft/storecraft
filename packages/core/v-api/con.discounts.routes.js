import { Polka } from '../v-polka/index.js'
import { assert } from './utils.func.js'
import { authorize_by_roles } from './con.auth.middle.js'
import { parse_query } from './utils.query.js'
import { get, list, list_discounts_products, remove, upsert } from './con.discounts.logic.js'

/**
 * @typedef {import('../types.api.js').DiscountType} ItemType
 */

/**
 * 
 * @template PlatformNativeRequest
 * @template PlatformContext
 * @param {import("../types.public.js").App<PlatformNativeRequest, PlatformContext>} app
 */
export const create_routes = (app) => {

  /** @type {import('../types.public.js').ApiPolka} */
  const polka = new Polka();

  const middle_authorize_admin = authorize_by_roles(app, ['admin'])

  // save tag
  polka.post(
    '/',
    middle_authorize_admin,
    async (req, res) => {
      const final = await upsert(app, req.parsedBody);
      res.sendJson(final);
    }
  )

  // get item
  polka.get(
    '/:handle',
    async (req, res) => {
      const handle_or_id = req?.params?.handle;
      const item = await get(app, handle_or_id);
      assert(item, 'not-found', 404);
      res.sendJson(item);
    }
  );

  // delete item
  polka.delete(
    '/:handle',
    middle_authorize_admin,
    async (req, res) => {
      const handle_or_id = req?.params?.handle;
      await remove(app, handle_or_id);
      res.end();
    }
  );

  // list
  polka.get(
    '/',
    async (req, res) => {
      let q = parse_query(req.query);
      const items = await list(app, q);
      res.sendJson(items);
    }
  );

  // query the eligibile products of a discount
  polka.get(
    '/:discount/products',
    async (req, res) => {
      const { discount } = req?.params;
      let q = parse_query(req.query);
      const items = await list_discounts_products(app, discount, q);
      res.sendJson(items);
    }
  );

  return polka;
}

