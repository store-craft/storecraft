import { Polka } from '../v-polka/index.js'
import { assert } from './utils.func.js'
import { parse_auth_user, roles_guard } from './middle.auth.js'
import { parse_query } from './utils.query.js'
import { get, list, remove, upsert } from './con.customers.logic.js'
import { owner_or_admin_guard } from './con.customers.middle.js'

/**
 * @typedef {import('../types.api.js').TagType} ItemType
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

  const middle_authorize_admin = roles_guard(['admin'])

  polka.use(parse_auth_user(app));

  // save tag
  polka.post(
    '/',
    owner_or_admin_guard,
    async (req, res) => {
      const final = await upsert(app, req.parsedBody);
      res.sendJson(final);
    }
  )

  // get item
  polka.get(
    '/:handle',
    owner_or_admin_guard,
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
      await remove(app, handle_or_id);
      res.end();
    }
  );

  // list
  polka.get(
    '/',
    middle_authorize_admin,
    async (req, res) => {
      let q = parse_query(req.query);
      const items = await list(app, q);
      res.sendJson(items);
    }
  );

  return polka;
}
