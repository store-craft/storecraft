import { Polka } from '../v-polka/index.js'
import { ID, apply_dates, assert, to_handle } from './utils.js'
import { z } from 'zod'
import { zod_validate_body } from './middle.zod-validate.js'
import { tagTypeSchema } from './types.autogen.zod.api.js'
import { authorize } from './middle.auth.js'

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
        'Handle is not valid', 400
      );

      // Check if tag exists
      const prev_tag = await app.db.tags.getByHandle(tag.handle);
      const save_mode = Boolean(tag.id)
      const id = !save_mode ? ID('tag') : tag.id

      assert(
        !save_mode && prev_tag?.handle!==tag.handle, 
        `Handle \`${tag.handle}\` already exists, choose another one !`, 400
      );

      await app.db.tags.upsert(
        apply_dates({ ...tag, id })
      )

      res.sendJson(
        {
          id
        }
      );
  
    }
  )

  // get tag
  polka.get(
    '/:handle',
    async (req, res) => {
      const handle_or_id = req?.params?.handle;
      const is_id = Boolean(handle_or_id?.includes('_'))
      let tag;

      if(is_id) 
        tag = await app.db.tags.get(handle_or_id);
      else
        tag = await app.db.tags.getByHandle(to_handle(handle_or_id));

      assert(tag, 'not-found', 404);

      res.sendJson(tag);
    }
  );

  // list
  polka.get(
    '/',
    async (req, res) => {
      console.log(req.query.toString())
      console.log(req.query.get('a>'))
      // const handle_or_id = req?.params?.handle;
      // const is_id = Boolean(handle_or_id?.includes('_'))
      // let tag;

      // if(is_id) 
      //   tag = await app.db.tags.get(handle_or_id);
      // else
      //   tag = await app.db.tags.getByHandle(to_handle(handle_or_id));

      // assert(tag, 'not-found', 404);

      res.sendJson({
        hello: "hola"
      });
    }
  );


  return polka;
}

