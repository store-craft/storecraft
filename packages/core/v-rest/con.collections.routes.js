import { Polka } from '../v-polka/index.js'
import { assert } from '../v-api/utils.func.js'
import { authorize_by_roles } from './con.auth.middle.js'
import { parse_query } from '../v-api/utils.query.js'
import { get, list, list_collection_products, remove, upsert } from '../v-api/con.collections.logic.js'

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

  // list a specific collection's products
  polka.get(
    '/:collection/products',
    async (req, res) => {
      const { collection } = req.params;
      let q = parse_query(req.query);
      const items = await list_collection_products(app, collection, q);
      res.sendJson(items);
    }
  );

  return polka;
}

