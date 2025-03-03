/**
 * @import { 
 *  AIEmbedder, VectorStore 
 * } from '../../../core/types.private.js'
 * @import {
 *  create_vector_index_params, create_vector_index_result, 
 *  query_vectors_params, query_vectors_result, vectorize_vector
 * } from './types.private.vectorize.js'
 * @import {
 *  Config
 * } from './types.js'
 */

export const NAMESPACE_KEY = '__namespace'

/**
 * @implements {VectorStore}
 */
export class Vectorize {
  /**
   * 
   * @param {Config} config 
   */
  constructor(config) {
    this.config = config;
  }

  #to_cf_url = (path = '') => {
    return `https://api.cloudflare.com/client/v4/accounts/${this.config.account_id}/vectorize/v2/indexes${path ? ('/' + path) : ''}`
  }

  /** @type {VectorStore["embedder"]} */
  get embedder() {
    return this.config.embedder
  }

  /** @type {VectorStore["addVectors"]} */
  addVectors = async (vectors, documents, options) => {

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

  /** @type {VectorStore["addDocuments"]} */
  addDocuments = async (documents, options) => {
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

    return this.addVectors(
      vectors, documents, options
    )
  }

  /** @type {VectorStore["delete"]} */
  delete = async (ids) => {
    const r = await fetch(
      this.#to_cf_url(`${this.config.index_name}/query`),
      {
        method: 'post',
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
   * @param {Omit<create_vector_index_params, 'name'>} params 
   * @returns {Promise<create_vector_index_result>}
   */
  createVectorIndex = async (params) => {

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
            ...params,
            name: this.config.index_name
          })
        )
      }
    );

    /** @type {create_vector_index_result} */
    const json = await r.json();

    return json;
  }

}