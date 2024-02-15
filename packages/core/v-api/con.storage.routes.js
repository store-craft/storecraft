import { Polka } from '../v-polka/index.js'
import { assert } from './utils.func.js'
import { authorize_by_roles } from './con.auth.middle.js'
import { does_prefer_signed } from './con.storage.logic.js';

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
        res.setStatus(401).end();
        return;
      }

      // console.log('req?.params ', req?.params);

      if(does_prefer_signed(req?.query) && app.storage.putSigned) {
        const r = await app.storage.putSigned(file_key)
        res.sendJson(r);
      } else {
        await app.storage.putStream(file_key, req.body);
        res.end();
      }
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

      // try to see if redirect is supported
      if(does_prefer_signed(req?.query) && app.storage.getSigned) {
        const r = await app.storage.getSigned(file_key)
        res.sendJson(r);
      } else {
        const s = await app.storage.getStream(file_key);
        if(s) {
          res.sendReadableStream(s.value);
          s?.metadata?.contentType && res.headers.set('Content-Type', s?.metadata?.contentType);
        } else {
          res.end(); 
        }
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

