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
  polka.put(
    '/*',
    // middle_authorize_admin,
    async (req, res) => {
      const file_key = req?.params?.['*'];
      if(!file_key) {
        // list them
        res.setStatus(401).end();
        return;
      }

      console.log('req?.params ', req?.params);

      // stream
      await app.storage.putStream(file_key, req.body);

      res.end();    
    }
  );
 
  // get file
  polka.get(
    '/*',
    async (req, res) => {
      const file_key = req?.params?.['*'];
      if(!file_key) {
        // list them
        return await app.storage.list();
      }

      console.log('req?.params ', req?.params)

      const s = await app.storage.getStream(file_key);
      if(s) {
        res.sendReadableStream(s.value);
        s?.metadata?.contentType && res.headers.set('Content-Type', s?.metadata?.contentType);
      } else {
        res.end(); 
      }
    }
  );


  // delete file
  polka.delete(
    '/*',
    middle_authorize_admin,
    async (req, res) => {
      const file_key = req?.params?.['*'];
      if(file_key) {
        await app.storage.remove(file_key);
      }
      res.end();
    }
  );


  return polka;
}

