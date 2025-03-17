/**
 * @import { 
 *  ApiQuery, QuickSearchResult, SimilaritySearchInput, SimilaritySearchResult 
 * } from '@storecraft/core/api'
 */

import { 
  api_query_to_searchparams, object_to_search_params, 
  string_array_to_string 
} from '@storecraft/core/api/utils.query.js';
import { StorecraftSDK } from '../index.js'
import { fetchApiWithAuth, url } from './utils.api.fetch.js';

/**
 * @description **Search** API (two options):
 * 
 * - Quick Search across many resources
 * - Similarity search across `discount`, `products`, `collections`, `shipping`
 * 
 */
export default class Search {

  /**
   * 
   * @param {StorecraftSDK} sdk 
   */
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * @description List super lite search results with `id`, `handle`, `title`. 
   * Primarily used for quick and responsive lookup, this is cheap and cost-effective 
   * and works well in the dashboard. If an admin is hitting the endpoint, then he can 
   * even get results for orders, customer and auth_users. You can also use the expand in the 
   * query to efficiently control which resources are searched at the database
   * @param {ApiQuery} params A regular {@link ApiQuery} object
   * @returns {Promise<QuickSearchResult>}
   */
  quick = async (params) => {

    /** @type {QuickSearchResult} */
    const json = await fetchApiWithAuth(
      this.sdk,
      'search',
      { method: 'get' },
      api_query_to_searchparams(params)
    );

    return json;
  }


  /**
   * @description Search Storecraft with AI for similar 
   * `products`, `discounts`, `collections`, `shipping`
   * based on a prompt
   * @param {SimilaritySearchInput} params A {@link SimilaritySearchInput} object
   * @returns {Promise<SimilaritySearchResult>}
   */
  similarity = async (params) => {

    /** @type {SimilaritySearchResult} */
    const json = await fetchApiWithAuth(
      this.sdk,
      'similarity-search',
      { method: 'get' },
      object_to_search_params({
        q: params.q,
        namespaces: string_array_to_string(params.namespaces),
        limit: params.limit ?? 5
      })
    );

    return json;
  }

}


