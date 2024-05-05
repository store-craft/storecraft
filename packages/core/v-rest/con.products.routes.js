import { Polka } from '../v-polka/index.js'
import { assert } from '../v-api/utils.func.js'
import { authorize_by_roles } from './con.auth.middle.js'
import { parse_expand, parse_query } from '../v-api/utils.query.js'


/**
 * @typedef {import('../v-api/types.api.js').ProductType} ItemType
 */

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

  const middle_authorize_admin = authorize_by_roles(app, ['admin'])

  // save 
  polka.post(
    '/',
    middle_authorize_admin,
    async (req, res) => {
      const final = await app.api.products.upsert(req.parsedBody);

      res.sendJson(final);
    }
  )

  // update item stock by a delta number
  polka.put(
    '/:handle',
    async (req, res) => {
      const handle_or_id = req?.params?.handle;
      const stockBy = parseInt(req?.query?.get('quantityBy'));

      if(stockBy) {
        await app.api.products.changeStockOfBy(
          [handle_or_id], [stockBy]
        );
      }

      res.end();
    }
  );


  // get item
  polka.get(
    '/:handle',
    async (req, res) => {
      const handle_or_id = req?.params?.handle;
      /** @type {import('../v-database/types.public.js').RegularGetOptions} */
      const options = {
        expand: parse_expand(req.query)
      };
      const item = await app.api.products.get(handle_or_id, options);

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
      const removed = handle_or_id && await app.api.products.remove(handle_or_id);

      res.setStatus(removed ? 200 : 404).end();
    }
  );

  // list
  polka.get(
    '/',
    async (req, res) => {
      const q = parse_query(req.query);
      const items = await app.api.products.list(q);

      res.sendJson(items);
    }
  );

  // add to collection
  polka.post(
    '/:product/collections/:collection',
    middle_authorize_admin,
    async (req, res) => {
      const { product, collection } = req?.params;
      await app.api.products.add_product_to_collection(product, collection);
      res.end();
    }
  );

  // remove from
  polka.delete(
    '/:product/collections/:collection',
    middle_authorize_admin,
    async (req, res) => {
      const { product, collection } = req?.params;
      await app.api.products.remove_product_from_collection(product, collection);
      res.end();
    }
  );
  
  polka.get(
    '/:product/collections',
    async (req, res) => {
      const { product } = req?.params;
      const items = await app.api.products.list_product_collections(product);
      res.sendJson(items);
    }
  );

  polka.get(
    '/:product/variants',
    async (req, res) => {
      const { product } = req?.params;
      const items = await app.api.products.list_product_variants(product);
      res.sendJson(items);
    }
  );

  polka.get(
    '/:product/discounts',
    async (req, res) => {
      const { product } = req?.params;
      const items = await app.api.products.list_product_discounts(product);
      res.sendJson(items);
    }
  );

  polka.get(
    '/:product/related',
    async (req, res) => {
      const { product } = req?.params;
      const items = await app.api.products.list_related_products(product);
      res.sendJson(items);
    }
  );

  return polka;
}

