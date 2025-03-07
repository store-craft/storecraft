/**
 * @import { 
 *  AgentRunParameters, AgentRunResponse 
 * } from '@storecraft/core/ai/agents/types.js'
 * @import { 
 *  ApiQuery, QuickSearchResult, SimilaritySearchInput, SimilaritySearchResult 
 * } from '@storecraft/core/api'
 */

import { api_query_to_searchparams, object_to_search_params, parse_query, string_array_to_string } from '@storecraft/core/api/utils.query.js';
import { HEADER_STORECRAFT_THREAD_ID } from '../../core/rest/con.ai.routes.js';
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
   * @description Speak with the main `storecraft` agent sync. It is
   * recommended to use the streamed version {@link streamSpeak}
   * @param {ApiQuery} params 
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
   * @description Speak with the main `storecraft` agent sync. It is
   * recommended to use the streamed version {@link streamSpeak}
   * @param {SimilaritySearchInput} params 
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


