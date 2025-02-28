/** 
 * @import { ApiPolka } from './types.public.js' 
 * @import { ApiQuery } from '../api/types.api.query.js' 
 * @import { OrderData } from '../api/types.api.js' 
 */
import { App } from '../index.js';
import { Polka } from '../polka/index.js'
import { assert } from '../api/utils.func.js'
import { assert_generic_auth, authorize_admin, 
  is_admin, parse_auth_user } from './con.auth.middle.js'
import { parse_query } from '../api/utils.query.js'

/**
 * @typedef {import('../api/types.api.d.ts').OrderData} ItemType
 */

/**
 * 
 * @param {App} app
 */
export const create_routes = (app) => {

  /** @type {ApiPolka} */
  const polka = new Polka();

  const middle_authorize_admin = authorize_admin(app);

  // save order
  polka.post(
    '/',
    middle_authorize_admin,
    async (req, res) => {
      const final = await app.api.orders.upsert(req.parsedBody);

      res.sendJson(final);
    }
  )

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
      const removed = handle_or_id && await app.api.orders.remove(handle_or_id);

      res.setStatus(removed ? 200 : 404).end();
    }
  );

  // list:
  // - admin can see all orders from all customers
  // - customer can see only his own orders
  // - anonymous can see nothing
  polka.get(
    '/',
    parse_auth_user(app),
    async (req, res) => {
      const q = (/** @type {ApiQuery<OrderData>} */ (
        parse_query(req.query))
      );
      
      let items = [];

      if(is_admin(req.user)) {
        items = await app.api.orders.list(q);
      } else if(req.user) {
        // authenticated user, but not admin
        const customer_id = req.user.sub?.replace('au', 'cus');

        items = await app.api.customers.list_customer_orders(customer_id, q);
      } else {
        assert_generic_auth(false);
      }

      res.sendJson(items);
    }
  );

  return polka;
}

