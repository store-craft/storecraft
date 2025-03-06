/** 
 * @import { ApiPolka } from './types.public.js' 
 * @import { VectorStoreSimilaritySearchQueryResult } from '../ai/types.public.js' 
 * @import { 
 *  StorecraftVectorMetaData, vector_namespaces 
 * } from '../ai/models/vector-stores/types.js' 
 * @import { SimilaritySearchResult } from '../api/types.api.js' 
 * @import { semantic_search_namespaces } from './con.semantic-search.types.js' 
 */

import { App } from '../index.js';
import { Polka } from '../polka/index.js'
import { parse_list_from_string, parse_number_from_string, parse_query } from '../api/utils.query.js'
import { is_admin, parse_auth_user } from './con.auth.middle.js';
import { assert, parse_json_safely } from '../api/utils.func.js';

/** @type {semantic_search_namespaces[]} */
export const allowed_namspaces = [
  '*', 'all', 'collections', 'discounts', 'products', 'shipping'
]

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

      assert(
        app.vectorstore,
        'Semantic Search is only available for apps with vector-store'
      );

      const q = req.query.get('q')?.trim();
      const top_k = parse_number_from_string(req.query.get('limit'), 5);
      const pre_namespaces = parse_list_from_string(req.query.get('namespaces'), ['all']);
      const includes_all = pre_namespaces.includes('all') || pre_namespaces.includes('*');
      const namespaces = includes_all ? allowed_namspaces.slice(2) : pre_namespaces;

      assert(
        q.length,
        'Semantic Search query is empty'
      );

      /** @type {VectorStoreSimilaritySearchQueryResult<StorecraftVectorMetaData>[]} */
      const items = await app.vectorstore.similaritySearch(
        q, top_k, namespaces
      );

      /** @type {SimilaritySearchResult[]} */
      const items_result = items.map(
        item => (
          {
            score: item.score,
            content: parse_json_safely(item?.document?.metadata?.json),
            namespace: /** @type {vector_namespaces} */(item.document.namespace)
          }
        )
      );

      res.sendJson(items_result);
    }
  );

  return polka;
}

