/** @import { ApiPolka } from './types.public.js' */
import { App } from '../index.js';
import { Polka } from '../polka/index.js'
import { assert } from '../api/utils.func.js'
import { authorize_by_roles } from './con.auth.middle.js'
import { parse_query } from '../api/utils.query.js'

/**
 * @typedef {import('../api/types.api.d.ts').ImageType} ItemType
 */

/**
 * 
 * @param {App} app
 */
export const create_routes = (app) => {

  /** @type {ApiPolka} */
  const polka = new Polka();

  const middle_authorize_admin = authorize_by_roles(app, ['admin'])
    
  // save tag
  polka.post(
    '/',
    middle_authorize_admin,
    async (req, res) => {
      const final = await app.api.images.upsert(req.parsedBody);

      res.sendJson(final);
    }
  )

  // get item
  polka.get(
    '/:handle',
    async (req, res) => {
      const handle_or_id = req?.params?.handle;
      const item = await app.api.images.get(handle_or_id);

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
      const removed = handle_or_id && await app.api.images.remove(handle_or_id);

      res.setStatus(removed ? 200 : 404).end();
    }
  );

  // list
  polka.get(
    '/',
    async (req, res) => {
      const q = parse_query(req.query);
      const items = await app.api.images.list(q);

      res.sendJson(items);
    }
  );

  return polka;
}
