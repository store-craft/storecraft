import { Polka } from '../v-polka/index.js'
import { assert } from '../v-api/utils.func.js'
import { authorize_by_roles } from './con.auth.middle.js'
import { parse_expand as parse_expand, parse_query } from '../v-api/utils.query.js'
import { add_product_to_collection, get, list, 
  list_product_collections, list_product_discounts, list_product_variants, 
  remove, remove_product_from_collection, upsert } from '../v-api/con.products.logic.js'

/**
 * @typedef {import('../types.api.js').ProductType} ItemType
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
      /** @type {import('../types.database.js').RegularGetOptions} */
      const options = {
        expand: parse_expand(req.query)
      };
      const item = await get(app, handle_or_id, options);
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

  // add to collection
  polka.post(
    '/:product/collections/:collection',
    middle_authorize_admin,
    async (req, res) => {
      const { product, collection } = req?.params;
      await add_product_to_collection(app, product, collection);
      res.end();
    }
  );

  // remove from
  polka.delete(
    '/:product/collections/:collection',
    middle_authorize_admin,
    async (req, res) => {
      const { product, collection } = req?.params;
      await remove_product_from_collection(app, product, collection);
      res.end();
    }
  );
  
  polka.get(
    '/:product/collections',
    async (req, res) => {
      const { product } = req?.params;
      const items = await list_product_collections(app, product);
      res.sendJson(items);
    }
  );

  // get all variants of a product
  polka.get(
    '/:product/variants',
    async (req, res) => {
      const { product } = req?.params;
      const items = await list_product_variants(app, product);
      res.sendJson(items);
    }
  );

  polka.get(
    '/:product/discounts',
    async (req, res) => {
      const { product } = req?.params;
      const items = await list_product_discounts(app, product);
      res.sendJson(items);
    }
  );

  return polka;
}

