import { Polka } from '../v-polka/index.js'
import { authorize_by_roles } from './con.auth.middle.js';
import openapi_html from './docs.openapi.scalar.html.js'
import openapi_json from './openapi.json' assert { type: 'json' }

/**
 * 
 * @template PlatformNativeRequest
 * @template PlatformContext
 * 
 * @param {import("../types.public.js").App<
 *  PlatformNativeRequest, PlatformContext
 * >} app
 */
export const create_routes = (app) => {

  /** @type {import('../types.public.js').ApiPolka} */
  const polka = new Polka();

  polka.get(
    '/openapi.json',
    async (req, res) => {
      res.sendJson(openapi_json);
    }
  );

  polka.get(
    '/',
    async (req, res) => {
      res.sendHtml(openapi_html);
    }
  );

  polka.get(
    '/settings',
    authorize_by_roles(app, ['admin']),
    async (req, res) => {
      res.sendJson(app.config);
    }
  );


  return polka;
}

