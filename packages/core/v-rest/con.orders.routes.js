import { Polka } from '../v-polka/index.js'
import { assert } from '../v-api/utils.func.js'
import { assert_generic_auth, authorize_admin, 
  authorize_by_roles, is_admin, parse_auth_user } from './con.auth.middle.js'
import { parse_query } from '../v-api/utils.query.js'
import { get, list, list_customer_orders, remove, upsert } from '../v-api/con.orders.logic.js'

/**
 * @typedef {import('../v-api/types.api.js').OrderData} ItemType
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

  const middle_authorize_admin = authorize_admin(app);

  // save order
  polka.post(
    '/',
    middle_authorize_admin,
    async (req, res) => {
      const final = await upsert(app, req.parsedBody);
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
      const item = await get(app, id);
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
      const removed = handle_or_id && await remove(app, handle_or_id);
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
      let q = parse_query(req.query);
      // auth id postfix === customer id postfix
      let items = [];
      if(is_admin(req.user)) {
        items = await list(app, q);
      } else if(req.user) {
        // authenticated user, but not admin
        const customer_id = req.user.sub?.replace('au', 'cus');
        items = await list_customer_orders(app, customer_id, q);
      } else {
        assert_generic_auth(false);
      }
      res.sendJson(items);
    }
  );

  return polka;
}

