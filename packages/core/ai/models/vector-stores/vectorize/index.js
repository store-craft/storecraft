/**
 * @import { 
 *  AIEmbedder, VectorStore 
 * } from '../../../core/types.private.js'
 * @import {
cf_response_wrapper,
 *  create_vector_index_params, create_vector_index_result, 
 *  query_vectors_params, query_vectors_result, vectorize_vector
 * } from './types.private.vectorize.js'
 * @import {
 *  Config
 * } from './types.js'
 */

export const NAMESPACE_KEY = '__namespace'
export const ENV_CF_ACCOUNT_ID = 'CF_ACCOUNT_ID'
export const ENV_CF_API_KEY = 'CF_API_KEY'
export const ENV_CF_VECTORIZE_API_KEY = 'CF_VECTORIZE_API_KEY'
export const ENV_CF_EMAIL = 'CF_EMAIL'

/**
 * @implements {VectorStore}
 */
export class Vectorize {

  /** @type {Config} */ #config;

  /**
   * 
   * @param {Config} config 
   */
  constructor(config) {
    this.#config = {
      index_name: 'vector_index',
      dimension: 1536,
      ...config,
    }
  }

  get config() {
    return this.#config;
  }

  /** @type {VectorStore["onInit"]} */
  onInit = (app) => {
    this.config.account_id = this.config.account_id ?? app.platform.env[ENV_CF_ACCOUNT_ID]; 
    this.config.api_key = this.config.api_key ?? app.platform.env[ENV_CF_VECTORIZE_API_KEY] 
          ?? app.platform.env[ENV_CF_API_KEY]; 
    this.config.cf_email = this.config.cf_email ?? app.platform.env[ENV_CF_EMAIL]; 
  }

  #to_cf_url = (path = '') => {
    return `https://api.cloudflare.com/client/v4/accounts/${this.config.account_id}/vectorize/v2/indexes${path ? ('/' + path) : ''}`
  }

  /** @type {VectorStore["embedder"]} */
  get embedder() {
    return this.config.embedder
  }

  /** @type {VectorStore["upsertVectors"]} */
  upsertVectors = async (vectors, documents, options) => {

    /** @type {vectorize_vector[]} */
    const cf_format = documents.map(
      (d, ix) => (
        {
          id: d.id,
          metadata: {
            ...d.metadata,
            [NAMESPACE_KEY]: d.namespace
          },
          values: vectors[ix]
        }
      )
    );
    const ndjson = cf_format.map(c => JSON.stringify(c)).join('\n')

    const r = await fetch(
      this.#to_cf_url(`${this.config.index_name}/upsert`),
      {
        method: 'post',
        headers: {
          'X-Auth-Email': this.config.cf_email,
          'X-Auth-Key': this.config.api_key,
          'Content-Type': 'application/x-ndjson'
        },
        body: ndjson
      }
    );

    /** @type {{mutationId: string}} */
    const json = await r.json();
  }

  /** @type {VectorStore["upsertDocuments"]} */
  upsertDocuments = async (documents, options) => {
    const result = await this.embedder.generateEmbeddings(
      {
        content: documents.map(
          doc => (
            {
              content: doc.pageContent,
              type: 'text'
            }
          )
        )
      }
    );

    const vectors = result.content;

    return this.upsertVectors(
      vectors, documents, options
    )
  }

  /** @type {VectorStore["delete"]} */
  delete = async (ids) => {
    const r = await fetch(
      this.#to_cf_url(`${this.config.index_name}`),
      {
        method: 'delete',
        headers: {
          'X-Auth-Email': this.config.cf_email,
          'X-Auth-Key': this.config.api_key,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids })
      }
    );

    /** @type {query_vectors_result} */
    const json = await r.json();
  }

  /** @type {VectorStore["similaritySearch"]} */
  similaritySearch = async (query, k, namespaces) => {

    const embedding_result = await this.embedder.generateEmbeddings(
      {
        content: [
          {
            content: query, 
            type: 'text'
          }
        ]
      }
    );
    const vector = embedding_result.content[0]

    /** @type {query_vectors_params} */
    const body = {
      vector,
      returnMetadata: 'all',
      returnValues: false,
      topK: k
    }

    if(Array.isArray(namespaces) && namespaces.length) {
      body.filter = {
        [NAMESPACE_KEY]: { $in: namespaces}
      }
    }

    const r = await fetch(
      this.#to_cf_url(`${this.config.index_name}/query`),
      {
        method: 'post',
        headers: {
          'X-Auth-Email': this.config.cf_email,
          'X-Auth-Key': this.config.api_key,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );

    /** @type {query_vectors_result} */
    const json = await r.json();

    return json.matches.map(
      (match) => {
        const { score, metadata } = match;
        const { pageContent, ...restMetaData } = metadata;
        return {
          score: match.score,
          document: {
            metadata: restMetaData,
            pageContent: pageContent
          }
        }
      }
    );
  }

  /**
   * 
   * @param {{ description?: string, metric?: create_vector_index_params["config"]["metric"] }} [params={}] 
   * @param {boolean} [delete_index_if_exists_before=false] 
   * @returns {Promise<cf_response_wrapper<create_vector_index_result>>}
   */
  createVectorIndex = async (params={}, delete_index_if_exists_before=false) => {
    
    if(delete_index_if_exists_before) {
      await this.deleteVectorIndex();
    }

    const r = await fetch(
      this.#to_cf_url(),
      {
        method: 'post',
        headers: {
          'X-Auth-Email': this.config.cf_email,
          'X-Auth-Key': this.config.api_key,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify( 
          /** @type {create_vector_index_params} */({
            name: this.config.index_name,
            description: params.description,
            config: {
              dimensions: this.config.dimension,
              metric: params.metric ?? 'cosine'
            }
          })
        )
      }
    );

    /** @type {cf_response_wrapper<create_vector_index_result>} */
    const json = await r.json();
    
    return json;
  }

  /**
   * 
   * @returns {Promise<boolean>}
   */
  deleteVectorIndex = async () => {
    
    const r = await fetch(
      this.#to_cf_url(this.config.index_name),
      {
        method: 'delete',
        headers: {
          'X-Auth-Email': this.config.cf_email,
          'X-Auth-Key': this.config.api_key,
          'Content-Type': 'application/json'
        }
      }
    );

    /** @type {cf_response_wrapper} */
    const json = await r.json();

    return json.success;
  }  
}