/** 
 * @import { ApiPolka } from './types.public.js' 
 * @import { ApiQuery } from '../api/types.api.query.js' 
 * @import { ShippingMethodType } from '../api/types.api.js' 
 */
import { App } from '../index.js';
import { Polka } from './polka/index.js'
import { assert } from '../api/utils.func.js'
import { authorize_admin } from './con.auth.middle.js'
import { parse_query } from '../api/query.js'

/**
 * 
 * @param {App} app
 */
export const create_routes = (app) => {

  /** @type {ApiPolka} */
  const polka = new Polka();

  const middle_authorize_admin = authorize_admin(app);

  // save tag
  polka.post(
    '/',
    middle_authorize_admin,
    async (req, res) => {
      const final = await app.api.shipping_methods.upsert(req.parsedBody);
      res.sendJson(final);
    }
  )

  polka.get(
    '/count_query',
    async (req, res) => {
      const q = (/** @type {ApiQuery<ShippingMethodType>} */ (
        parse_query(req.query))
      );
      const count = await app.api.shipping_methods.count(q);

      res.sendJson(count);
    }
  );


  // get item
  polka.get(
    '/:handle',
    async (req, res) => {
      const handle_or_id = req?.params?.handle;
      const item = await app.api.shipping_methods.get(handle_or_id);

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
      const removed = handle_or_id && await app.api.shipping_methods.remove(handle_or_id);
      res.sendJson(removed);
    }
  );

  // list
  polka.get(
    '/',
    async (req, res) => {
      const q = (/** @type {ApiQuery<ShippingMethodType>} */ (
        parse_query(req.query))
      );
      const items = await app.api.shipping_methods.list(q);

      res.sendJson(items);
    }
  );

  return polka;
}

