/** @import { ApiPolka } from './types.public.js' */
import { App } from '../index.js';
import { Polka } from './polka/index.js'
import { authorize_admin } from './con.auth.middle.js'
import { does_prefer_signed } from '../api/con.storage.logic.js';
import { StorecraftError } from '../api/utils.func.js';

export const HEADER_PRESIGNED = 'X-STORECRAFT-STORAGE-PRESIGNED';

/**
 * 
 * @param {App} app
 */
export const create_routes = (app) => {

  /** @type {ApiPolka} */
  const polka = new Polka();
  const features = app.storage.features() ?? { supports_signed_urls: false };
  const supports_signed = features.supports_signed_urls;

  const middle_authorize_admin = authorize_admin(app);

  // get features
  polka.get(
    '/',
    async (req, res) => {
      res.sendJson(features);
    }
  );
  
  // upload file
  polka.put(
    '/*',
    middle_authorize_admin,
    async (req, res) => {
      const file_key = req?.params?.['*'];

      if(!file_key) {
        res.setStatus(401).end();

        return;
      }

      // console.log('req?.params ', req?.params);

      if(does_prefer_signed(req?.query) && supports_signed) {
        // if(!supports_signed) {
        //   throw new StorecraftError(
        //     'Storage driver does not support signed urls',
        //     501
        //   );
        // }

        const r = await app.storage.putSigned(file_key);

        res.headers.set(HEADER_PRESIGNED, 'true');
        res.sendJson(r);
      } else {
        
        await app.storage.putStream(
          file_key, req.body, {}, 
          parseInt(req.headers.get("Content-Length") ?? '0')
        );

        res.headers.set(HEADER_PRESIGNED, 'false');
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
      if(does_prefer_signed(req?.query) && supports_signed) {
        // if(!supports_signed) {
        //   throw new StorecraftError(
        //     'Storage driver does not support signed urls',
        //     501
        //   );
        // }

        const r = await app.storage.getSigned(file_key);

        res.headers.set(HEADER_PRESIGNED, 'true');
        res.sendJson(r);
      } else {
        const s = await app.storage.getStream(file_key);

        // console.log(s)

        if(s?.value) {
          res.sendReadableStream(s.value);

          s?.metadata?.contentType && res.headers.set(
            'Content-Type', s?.metadata?.contentType
          );

          res.headers.set(HEADER_PRESIGNED, 'false');
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

