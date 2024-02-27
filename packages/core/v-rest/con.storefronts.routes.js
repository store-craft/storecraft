import { Polka } from '../v-polka/index.js'
import { assert } from '../v-api/utils.func.js'
import { authorize_by_roles } from './con.auth.middle.js'
import { parse_query } from '../v-api/utils.query.js'
import { get, list, list_storefront_collections, 
  list_storefront_discounts, list_storefront_posts, 
  list_storefront_products, list_storefront_shipping_methods, 
  remove, upsert } from '../v-api/con.storefronts.logic.js'

/**
 * @typedef {import('../v-api/types.api.js').TagType} ItemType
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
      const removed = handle_or_id && await remove(app, handle_or_id);
      res.setStatus(removed ? 200 : 404).end();
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

  // list
  polka.get(
    '/:handle/products',
    async (req, res) => {
      const { handle } = req.params;
      const items = await list_storefront_products(app, handle);
      res.sendJson(items);
    }
  );

  polka.get(
    '/:handle/collections',
    async (req, res) => {
      const { handle } = req.params;
      const items = await list_storefront_collections(app, handle);
      res.sendJson(items);
    }
  );

  polka.get(
    '/:handle/discounts',
    async (req, res) => {
      const { handle } = req.params;
      const items = await list_storefront_discounts(app, handle);
      res.sendJson(items);
    }
  );

  polka.get(
    '/:handle/shipping_methods',
    async (req, res) => {
      const { handle } = req.params;
      const items = await list_storefront_shipping_methods(app, handle);
      res.sendJson(items);
    }
  );

  polka.get(
    '/:handle/posts',
    async (req, res) => {
      const { handle } = req.params;
      const items = await list_storefront_posts(app, handle);
      res.sendJson(items);
    }
  );

  return polka;
}

