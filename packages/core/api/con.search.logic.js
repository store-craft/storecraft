/**
 * @import { ApiQuery } from './types.api.query.js'
 * @import { SimilaritySearchInput, SimilaritySearchResult } from './types.api.js'
 */

import { App } from '../index.js';
import { assert, parse_json_safely } from './utils.func.js';

/**
 * @param {App} app
 */
export const db = app => app.db.resources.search;

/**
 * @param {App} app
 */
export const quicksearch = (app) => 
/**
 * @description quicksearch for resources in the app db.
 * @param {ApiQuery} query
 */
(query) => {
  return app.db.resources.search.quicksearch(
    {
      expand: ['*'],
      ...query
    }
  );
}

/** @type {SimilaritySearchInput["namespaces"]} */
export const allowed_similarity_search_namspaces = [
  '*', 'all', 'collections', 'discounts', 'products', 'shipping'
]

/**
 * @param {App} app
 */
export const similarity = (app) => 
  /**
   * @description semantic search for resources in the app db.
   * @param {SimilaritySearchInput} query
   */
  async (query) => {
    assert(
      app.vectorstore,
      'Similarity / Semantic Search is only available for apps with vector-store'
    );

    assert(
      query && query.q?.length,
      'Similarity / Semantic Search query is empty'
    );

    const pre_namespaces = query.namespaces?.length ? query.namespaces : ['all'];
    const includes_all = pre_namespaces.includes('all') || pre_namespaces.includes('*');
    const namespaces = includes_all ? allowed_similarity_search_namspaces.slice(2) : pre_namespaces;

    const items = await app.vectorstore.similaritySearch(
      query.q, query.limit ?? 5, namespaces
    );

    /** @type {SimilaritySearchResult[]} */
    const items_result = items.map(
      item => (
        {
          score: item.score,
          content: parse_json_safely(
            String(item?.document?.metadata?.json)
          ),
          namespace: /** @type {SimilaritySearchResult["namespace"]} */(
            item.document.namespace
          )
        }
      )
    );

    return items_result;
  }
  

/**
 * @param {App} app
 */  
export const inter = app => {

  return {
    quicksearch: quicksearch(app),
    similarity: similarity(app),
  }
}
