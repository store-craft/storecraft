import { Polka } from '../v-polka/index.js'
import { ID, apply_dates, assert, to_handle } from './utils.js'
import { z } from 'zod'
import { zod_validate_body } from './middle.zod-validate.js'
import { tagTypeSchema } from './types.autogen.zod.api.js'
import { authorize } from './middle.auth.js'
import { parse_query } from './func.query.js'

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

  // save tag
  polka.post(
    '/',
    middle_authorize_admin,
    zod_validate_body(tagTypeSchema),
    async (req, res) => {

      /** @type {TagType} */
      const tag = req.parsedBody;

      // verify handles
      assert(
        [tag.handle, ...tag.values].every(
          h => to_handle(h)===h
        ),
        'Handle or Values are invalid', 400
      );

      // Check if tag exists
      const save_mode = Boolean(tag.id)
      const prev_tag = await app.db.tags.get(tag.id ?? tag.handle);
      const id = !save_mode ? ID('tag') : tag.id

      if(save_mode) {
        assert(
          prev_tag, 
          `Item with id \`${tag?.id}\` doesn't exist !`, 400);
        assert(
          prev_tag?.handle===tag.handle, 
          `Item with id \`${prev_tag?.id}\` has a handle \`${prev_tag?.handle}!=${tag.handle}\` !`, 400
        );
      } else { // create mode
        assert(
          !prev_tag, 
          `Handle \`${prev_tag?.handle}\` already exists!`, 400
        );
      }

      const final = apply_dates(
        { 
          ...tag, id,
          search: [tag.handle, ...(tag.values ?? [])]
        }
      );

      await app.db.tags.upsert(final);

      res.sendJson(final);
    }
  )

  // get tag
  polka.get(
    '/:handle',
    async (req, res) => {
      const handle_or_id = req?.params?.handle;
      const tag = await app.db.tags.get(handle_or_id);
      assert(tag, 'not-found', 404);
      res.sendJson(tag);
    }
  );

  // delete tag
  polka.delete(
    '/:handle',
    middle_authorize_admin,
    async (req, res) => {
      const handle_or_id = req?.params?.handle;
      await app.db.tags.remove(handle_or_id);
      res.end();
    }
  );

  // list
  polka.get(
    '/',
    async (req, res) => {
      let q = parse_query(req.query);
      const list = await app.db.tags.list(q);
      res.sendJson(list);
    }
  );

  return polka;
}
