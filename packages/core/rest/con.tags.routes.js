/** 
 * @import { ApiPolka } from './types.public.js' 
 * @import { ApiQuery } from '../api/types.api.query.js' 
 * @import { TagType } from '../api/types.api.js' 
 */
import { App } from '../index.js';
import { Polka } from './polka/index.js'
import { assert } from '../api/utils.func.js'
import { authorize_admin } from './con.auth.middle.js'
import { parse_query } from '../api/utils.query.js'

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
      const final = await app.api.tags.upsert(req.parsedBody);
      res.sendJson(final);
    }
  )

  polka.get(
    '/count_query',
    async (req, res) => {
      const q = (/** @type {ApiQuery<TagType>} */ (
        parse_query(req.query))
      );
      const count = await app.api.tags.count(q);
      res.sendJson(count);
    }
  );

  // get item
  polka.get(
    '/:handle',
    async (req, res) => {
      const handle_or_id = req?.params?.handle;
      const item = await app.api.tags.get(handle_or_id);

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
      const removed = handle_or_id && await app.api.tags.remove(handle_or_id);
      res.sendJson(removed);
    }
  );

  // list
  polka.get(
    '/',
    async (req, res) => {
      const q = (/** @type {ApiQuery<TagType>} */ (
        parse_query(req.query))
      );
      const items = await app.api.tags.list(q);
      res.sendJson(items);
    }
  );

  return polka;
}

