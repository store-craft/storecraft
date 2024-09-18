/** @import { ApiPolka } from './types.public.js' */
import { App } from '../index.js';
import { Polka } from '../v-polka/index.js'
import { parse_query } from '../v-api/utils.query.js'
import { is_admin, parse_auth_user } from './con.auth.middle.js';

/**
 * @typedef {import('../v-api/types.api.d.ts').TagType} ItemType
 */

/**
 * 
 * @param {App} app
 */
export const create_routes = (app) => {

  /** @type {ApiPolka} */
  const polka = new Polka();

  // search
  polka.get(
    '/',
    parse_auth_user(app),
    async (req, res) => {
      const q = parse_query(req.query);
      const items = await app.api.search.quicksearch(q);

      if(!is_admin(req.user)) {
        delete items?.['orders'];
        delete items?.['customers'];
        delete items?.['auth_users'];
      }

      res.sendJson(items);
    }
  );

  return polka;
}

