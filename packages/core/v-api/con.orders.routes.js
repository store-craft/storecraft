import { Polka } from '../v-polka/index.js'
import { assert } from './utils.func.js'
import { authorize_by_roles, is_admin, parse_auth_user } from './con.auth.middle.js'
import { parse_query } from './utils.query.js'
import { get, list, remove, upsert } from './con.orders.logic.js'

/**
 * @typedef {import('../types.api.js').OrderData} ItemType
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

  // get item, this is public because ids are cryptographic
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
      await remove(app, handle_or_id);
      res.end();
    }
  );

  // list,
  // todo: allow admin or user
  polka.get(
    '/',
    async (req, res) => {
      let q = parse_query(req.query);
      const items = await list(app, q);
      res.sendJson(items);
    }
  );

  return polka;
}

