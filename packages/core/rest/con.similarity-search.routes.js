/** 
 * @import { ApiPolka } from './types.public.js' 
 * @import { 
 *  SimilaritySearchAllowedNamespaces, SimilaritySearchResult 
 * } from '../api/types.api.js' 
 */

import { App } from '../index.js';
import { Polka } from '../polka/index.js'
import { parse_list_from_string, parse_number_from_string } from '../api/utils.query.js'
import { is_admin, parse_auth_user } from './con.auth.middle.js';

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

      const q = req.query.get('q')?.trim();
      const limit = parse_number_from_string(req.query.get('limit'), 5);
      const namespaces = /** @type {SimilaritySearchAllowedNamespaces[]} */ (
        parse_list_from_string(req.query.get('namespaces'), ['all'])
      );

      const result = await app.api.search.similarity(
        {
          q, limit, namespaces
        }
      );

      res.sendJson(result);
    }
  );

  return polka;
}

