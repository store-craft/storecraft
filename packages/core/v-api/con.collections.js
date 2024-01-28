import { Polka } from '../v-polka/index.js'
import { ID, apply_dates, assert, to_handle } from './utils.func.js'
import { z } from 'zod'
import { zod_validate_body } from './middle.zod-validate.js'
import { collectionTypeSchema } from './types.autogen.zod.api.js'
import { authorize } from './middle.auth.js'
import { parse_query } from './utils.query.js'
import { create_search_index } from './utils.index.js'
import { assert_save_create_mode } from './con.shared.js'

/**
 * @typedef {import('../types.api.js').TagType} TagType
 */



/**
 * 
 * @template PlatformNativeRequest
 * @template PlatformContext
 * @param {import("../types.public.js").App<PlatformNativeRequest, PlatformContext>} app
 */
export const create = (app) => {

  /** @type {import('../types.public.js').ApiPolka} */
  const polka = new Polka();

  const middle_authorize_admin = authorize(app, ['admin'])

  const db = app.db.collections;

  // save tag
  polka.post(
    '/',
    middle_authorize_admin,
    zod_validate_body(collectionTypeSchema),
    async (req, res) => {

      /** @type {import('../types.api.js').CollectionType} */
      const item = req.parsedBody;

      // verify handles
      assert(
        [item.handle].every(
          h => to_handle(h)===h
        ),
        'Handle or Values are invalid', 400
      );

      // Check if tag exists
      const id = !Boolean(item.id) ? ID('col') : item.id

      // Check if exists
      await assert_save_create_mode(item, db);

      // search index
      let search = create_search_index(item);

      // apply dates and index
      const final = apply_dates(
        { 
          ...item, id, search
        }
      );

      await db.upsert(final);

      res.sendJson(final);
    }
  )

  // get item
  polka.get(
    '/:handle',
    async (req, res) => {
      const handle_or_id = req?.params?.handle;
      const item = await db.get(handle_or_id);
      assert(item, 'not-found', 404);
      res.sendJson(item);
    }
  );

  // delete item
  polka.delete(
    '/:handle',
    middle_authorize_admin,
    async (req, res) => {
      const handle_or_id = req.params?.handle;
      await db.remove(handle_or_id);
      res.end();
    }
  );

  // list
  polka.get(
    '/',
    async (req, res) => {
      let q = parse_query(req.query);
      const list = await db.list(q);
      res.sendJson(list);
    }
  );

  polka.post(
    '/:handle/export',
    middle_authorize_admin,
    async (req, res) => {
      const handle_or_id = req?.params?.handle;
      assert(false, 'implement me !!!!')
    }
  );

  return polka;
}
