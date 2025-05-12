/** @import { ApiPolka } from './types.public.js' */
import { App } from '../index.js';
import { Polka } from './polka/index.js'
import { authorize_admin } from './con.auth.middle.js';
import openapi_html from './docs.openapi.scalar.html.js'
import openapi_json from './openapi.json' with { type: 'json' }
import { favicon } from './con.dashboard.routes.js';

/**
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
    authorize_admin(app),
    async (req, res) => {
      res.sendJson(
        {
          ...app.config,
          core_version: app.info.core_version
        }
      );
    }
  );

  // public info
  polka.get(
    '/info',
    async (req, res) => {
      res.sendJson(app.info);
    }
  );

  polka.get(
    '/favicon.ico',
    async (req, res) => {
      res.headers.set("Content-Type", "image/svg+xml");
      res.send(favicon);
    }
  );
 

  return polka;
}

