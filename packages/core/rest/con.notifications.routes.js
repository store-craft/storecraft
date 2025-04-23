/** 
 * @import { ApiPolka } from './types.public.js' 
 * @import { ApiQuery } from '../api/types.api.query.js' 
 * @import { NotificationType } from '../api/types.api.js' 
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

  polka.use(authorize_admin(app));

  polka.post(
    '/',
    async (req, res) => {
      const final = await app.api.notifications.upsert(
        req.parsedBody
      );
      res.sendJson(final);
    }
  );

  polka.get(
    '/count_query',
    async (req, res) => {
      let q = (/** @type {ApiQuery<NotificationType>} */ (
        parse_query(req.query))
      );
      const count = await app.api.notifications.count(q);
      res.sendJson(count);
    }
  );

  // get item
  polka.get(
    '/:handle',
    async (req, res) => {
      const handle_or_id = req?.params?.handle;
      const item = await app.api.notifications.get(handle_or_id);
      assert(item, 'not-found', 404);
      res.sendJson(item);
    }
  );

  // delete item
  polka.delete(
    '/:handle',
    async (req, res) => {
      const handle_or_id = req?.params?.handle;
      const removed = handle_or_id && 
        await app.api.notifications.remove(handle_or_id);
      res.sendJson(removed);
    }
  );

  // list
  polka.get(
    '/',
    async (req, res) => {
      let q = (/** @type {ApiQuery<NotificationType>} */ (
        parse_query(req.query))
      );
      const items = await app.api.notifications.list(q);
      res.sendJson(items);
    }
  );

  return polka;
}

