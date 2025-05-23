/** 
 * @import { ApiPolka } from './types.public.js' 
 * @import { ApiQuery } from '../api/types.api.query.js' 
 * @import { DiscountType, ProductType } from '../api/types.api.js' 
 */
import { App } from '../index.js';
import { Polka } from './polka/index.js'
import { assert } from '../api/utils.func.js'
import { authorize_admin } from './con.auth.middle.js'
import { parse_query } from '../api/query.js'

/**
 * @param {App} app
 */
export const create_routes = (app) => {

  /** @type {ApiPolka} */
  const polka = new Polka();

  const middle_authorize_admin = authorize_admin(app)

  polka.post(
    '/',
    middle_authorize_admin,
    async (req, res) => {
      const final = await app.api.discounts.upsert(
        req.parsedBody
      );
      res.sendJson(final);
    }
  )

  polka.get(
    '/count_query',
    async (req, res) => {
      let q = (/** @type {ApiQuery<DiscountType>} */ (
        parse_query(req.query))
      );
      const count = await app.api.discounts.count(q);
      res.sendJson(count);
    }
  );


  // get item
  polka.get(
    '/:handle',
    async (req, res) => {
      const handle_or_id = req?.params?.handle;
      const item = await app.api.discounts.get(handle_or_id);
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
      const removed = handle_or_id && 
        await app.api.discounts.remove(handle_or_id);
      res.sendJson(removed);
    }
  );

  // list
  polka.get(
    '/',
    async (req, res) => {
      let q = (/** @type {ApiQuery<DiscountType>} */ (
        parse_query(req.query))
      );
      const items = await app.api.discounts.list(q);
      res.sendJson(items);
    }
  );

  polka.get(
    '/:discount/products/used_tags',
    async (req, res) => {
      const { discount } = req.params;
      const items = await app.api.discounts.list_used_discount_products_tags(discount);
      res.sendJson(items);
    }
  ); 

  // query the eligibile products of a discount
  polka.get(
    '/:discount/products/count_query',
    async (req, res) => {
      const { discount } = req?.params;
      const q = (/** @type {ApiQuery<ProductType>} */ (
        parse_query(req.query))
      );
      const count = await app.api.discounts.count_discount_products_query(
        discount, q
      );
      res.sendJson(count);
    }
  );

  polka.get(
    '/:discount/products',
    async (req, res) => {
      const { discount } = req?.params;
      const q = (/** @type {ApiQuery<ProductType>} */ (
        parse_query(req.query))
      );
      const items = await app.api.discounts.list_discount_products(
        discount, q
      );
      res.sendJson(items);
    }
  );

  return polka;
}

