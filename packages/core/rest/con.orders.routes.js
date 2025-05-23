/** 
 * @import { ApiPolka } from './types.public.js' 
 * @import { ApiQuery } from '../api/types.api.query.js' 
 * @import { OrderData } from '../api/types.api.js' 
 */
import { App } from '../index.js';
import { Polka } from './polka/index.js'
import { assert } from '../api/utils.func.js'
import { assert_generic_auth, authorize_admin, 
  is_admin, parse_auth_user } from './con.auth.middle.js'
import { parse_query } from '../api/query.js'

/**
 * 
 * @param {App} app
 */
export const create_routes = (app) => {

  /** @type {ApiPolka} */
  const polka = new Polka();

  const middle_authorize_admin = authorize_admin(app);

  polka.post(
    '/',
    middle_authorize_admin,
    async (req, res) => {
      const final = await app.api.orders.upsert(
        req.parsedBody
      );
      res.sendJson(final);
    }
  );

  polka.get(
    '/count_query',
    middle_authorize_admin,
    async (req, res) => {
      const q = (/** @type {ApiQuery<OrderData>} */ (
        parse_query(req.query))
      );
      const count = await app.api.orders.count(q);
      res.sendJson(count);
    }
  );

  polka.get(
    '/me',
    parse_auth_user(app),
    async (req, res) => {
      const q = (/** @type {ApiQuery<OrderData>} */ (
        parse_query(req.query))
      );

      if(req.user?.email) {
        // authenticated user, but not admin
        const items = await app.api.orders.list_my_orders(
          req.user.email, q
        );
        res.sendJson(items);
      } else {
        assert_generic_auth(false);
      }
    }
  );

  
  // 
  // get order is public because ids are cryptographic:
  // - but, if you are not admin, payment gateway is partially hidden
  polka.get(
    '/:id',
    parse_auth_user(app),
    async (req, res) => {
      const id = req?.params?.id;
      const item = await app.api.orders.get(id);

      assert(item, 'not-found', 404);

      if(!is_admin(req.user)) {
        // non admins won't see gateway
        delete item?.payment_gateway?.on_checkout_create;
      }
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
        await app.api.orders.remove(handle_or_id);
      res.sendJson(removed);
    }
  );


  polka.get(
    '/',
    middle_authorize_admin,
    async (req, res) => {
      const q = (/** @type {ApiQuery<OrderData>} */ (
        parse_query(req.query))
      );
      let items = await app.api.orders.list(q);
      res.sendJson(items);
    }
  );

  

  return polka;
}

