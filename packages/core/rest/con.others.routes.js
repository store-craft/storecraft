/** @import { ApiPolka } from './types.public.js' */
import { App } from '../index.js';
import { Polka } from '../polka/index.js'
import { authorize_by_roles } from './con.auth.middle.js';
import openapi_html from './docs.openapi.scalar.html.js'
import openapi_json from './openapi.json' with { type: 'json' }

/**
 * 
 * @param {App} app
 */
export const create_routes = (app) => {

  /** @type {ApiPolka} */
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

