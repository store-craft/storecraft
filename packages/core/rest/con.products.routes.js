/** 
 * @import { ApiPolka } from './types.public.js' 
 * @import { ApiQuery } from '../api/types.api.query.js' 
 * @import { ProductType, VariantType } from '../api/types.api.js' 
 * @import { RegularGetOptions } from '../database/types.public.js' 
 */
import { App } from '../index.js';
import { Polka } from './polka/index.js'
import { assert } from '../api/utils.func.js'
import { authorize_admin } from './con.auth.middle.js'
import { parse_expand, parse_query } from '../api/utils.query.js'

/**
 * 
 * @param {App} app
 */
export const create_routes = (app) => {

  /** @type {ApiPolka} */
  const polka = new Polka();

  const middle_authorize_admin = authorize_admin(app);

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
      } else {
        res.status = 400;
      }

      res.end();
    }
  );

  polka.get(
    '/used_tags',
    async (req, res) => {
      const items = await app.api.products.list_used_products_tags();
      res.sendJson(items);
    }
  );

  polka.get(
    '/count_query',
    async (req, res) => {
      const q = (/** @type {ApiQuery<ProductType | VariantType>} */ (
        parse_query(req.query))
      );
      const count = await app.api.products.count(q)
      res.sendJson({ count });
    }
  );

  // get item
  polka.get(
    '/:handle',
    async (req, res) => {
      const handle_or_id = req?.params?.handle;
      /** @type {RegularGetOptions} */
      const options = {
        expand: parse_expand(req.query)
      };
      const item = await app.api.products.get(handle_or_id, options);

      assert(item, 'not-found', 404);

      res.sendJson(item);
    }
  );

  // list
  polka.get(
    '/',
    async (req, res) => {
      const q = (/** @type {ApiQuery<ProductType>} */ (
        parse_query(req.query))
      );
      const items = await app.api.products.list(q);

      res.sendJson(items);
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
      const items = await app.api.products.list_all_product_collections(product);
      res.sendJson(items);
    }
  );

  polka.get(
    '/:product/variants',
    async (req, res) => {
      const { product } = req?.params;
      const items = await app.api.products.list_all_product_variants(product);
      res.sendJson(items);
    }
  );

  polka.get(
    '/:product/discounts',
    async (req, res) => {
      const { product } = req?.params;
      const items = await app.api.products.list_all_product_discounts(product);
      res.sendJson(items);
    }
  );

  polka.get(
    '/:product/related',
    async (req, res) => {
      const { product } = req?.params;
      const items = await app.api.products.list_all_related_products(product);
      res.sendJson(items);
    }
  );

  return polka;
}

