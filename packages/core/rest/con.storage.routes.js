/** @import { ApiPolka } from './types.public.js' */
import { App } from '../index.js';
import { Polka } from './polka/index.js'
import { authorize_admin } from './con.auth.middle.js'
import { assert } from '../api/utils.func.js';

export const HEADER_PRESIGNED = 'X-STORECRAFT-STORAGE-PRESIGNED';

/**
 * @description prefer signed url get by default
 * 
 * @param {URLSearchParams} search_params
 */
export const does_prefer_signed = search_params => {
  return (
    search_params?.get('signed')?.trim() ?? 'true'
  ) !== 'false';
}

/**
 * @param {App} app 
 */
const supports_signed = async (app) => {
  const features = await app.api.storage.features();
  return features?.supports_signed_urls ?? false;
}


/**
 * @param {App} app
 */
export const create_routes = (app) => {

  /** @type {ApiPolka} */
  const polka = new Polka();

  const middle_authorize_admin = authorize_admin(app);

  // get features
  polka.get(
    '/',
    async (req, res) => {
      res.sendJson(
        await app.api.storage.features()
      );
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

      if(
        does_prefer_signed(req?.query) && 
        (await supports_signed(app))
      ) {
        res.headers.set(HEADER_PRESIGNED, 'true');
        res.sendJson(
          await app.api.storage.putSigned(file_key)
        );
      } else {
        res.headers.set(HEADER_PRESIGNED, 'false');
        res.sendJson(
          await app.api.storage.putStream(
            file_key, req.body, {}, 
            parseInt(req.headers.get("Content-Length") ?? '0')
          )
        );
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

      if(
        does_prefer_signed(req?.query) && 
        (await supports_signed(app))
      ) {
        res.headers.set(HEADER_PRESIGNED, 'true');
        res.sendJson(
          await app.api.storage.getSigned(file_key)
        );
      } else {
        const s = await app.api.storage.getStream(file_key);

        // console.log({s})

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

      assert(
        file_key, 
        'file storage path is required'
      );

      res.sendJson(
        await app.api.storage.remove(file_key)
      );
    }
  );


  return polka;
}

