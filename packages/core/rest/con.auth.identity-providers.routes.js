/** 
 * @import { ApiPolka } from './types.public.js' 
 */
import { App } from '../index.js';
import { Polka } from './polka/index.js'
import { authorize_admin } from './con.auth.middle.js';

/**
 * 
 * @param {App} app
 */
export const create_routes = (app) => {

  /** @type {ApiPolka} */
  const polka = new Polka();

  // list providers
  polka.get(
    '/',
    async (req, res) => {
      res.sendJson(
        app.api.auth.identity_providers_list() ?? []
      );
    }
  );

  
  // signin
  polka.post(
    '/create-authorization-uri',
    async (req, res) => {
      // console.log({req})
      const result = await app.api.auth.identity_provider_create_auth_uri(
        req.parsedBody
      );
      res.sendJson(result);
    }
  );

  // refresh 
  polka.post(
    '/sign',
    async (req, res) => {
      const result = await app.api.auth.identity_provider_sign_with(
        req.parsedBody
      );
      res.sendJson(result);
    }
  );

  return polka;
}

