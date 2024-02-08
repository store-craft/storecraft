import { Polka } from '../v-polka/index.js'
import { assert } from './utils.func.js'
import { authorize_by_roles } from './middle.auth.js'
import { parse_query } from './utils.query.js'
import { get, list, remove, upsert } from './con.tags.logic.js'

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

  const middle_authorize_admin = authorize_by_roles(app, ['admin'])

  // upload file, todo
  polka.post(
    '/',
    middle_authorize_admin,
    async (req, res) => {
      // const final = await upsert(app, req.parsedBody);
      // res.sendJson(final);
    }
  )

  // get file
  polka.get(
    // '/:file_key[.]*',
    '/*',
    async (req, res) => {
      const file_key = req?.params?.['*'];
      if(file_key===undefined) {
        // list them
        return await app.storage.list();
      }

      console.log('req?.params ', req?.params)

      const blob = await app.storage.get(file_key);
      console.log(blob.size)
      res.sendBlob(blob);
    }
  );

  // delete file
  polka.delete(
    '/:file_key',
    middle_authorize_admin,
    async (req, res) => {
      const { file_key } = req?.params;
      await app.storage.remove(file_key);
      res.end();
    }
  );

  // list files, todo
  polka.get(
    '/',
    async (req, res) => {
      const items = app.storage.list();
      res.sendJson(items);
    }
  );

  return polka;
}

