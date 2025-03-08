/**
 * @import { 
 *  AIEmbedder, VectorStore 
 * } from '../../../core/types.private.js'
 * @import {
 *  create_vector_index_params, create_vector_index_result, 
 *  query_vectors_params, query_vectors_result, upsert_vector_params, vector
 * } from './types.private.js'
 * @import {
 *  Config
 * } from './types.js'
 * @import { ENV } from '../../../../types.public.js';
 */

import { truncate_or_pad_vector } from '../index.js';

export const NAMESPACE_KEY = '__namespace';

/**
 * @implements {VectorStore}
 */
export class Pinecone {

  /** @satisfies {ENV<Config>} */
  static EnvConfig = /** @type{const} */ ({
    api_key: 'PINECONE_API_KEY'
  });

  #host_name_cache = ''
  /** @type {Config} */ #config;

  /**
   * 
   * @param {Config} config 
   */
  constructor(config) {
    this.#config = {
      dimension: 1536,
      index_name: 'vector-index',
      ...config,
    };
  }

  get config() {
    return this.#config;
  }

  /** @type {VectorStore["onInit"]} */
  onInit = (app) => {
    this.config.api_key ??= app.platform.env[Pinecone.EnvConfig.api_key]; 
  }

  /** @type {VectorStore["embedder"]} */
  get embedder() {
    return this.config.embedder
  }

  fetchIndexHostName = async () => {
    this.#host_name_cache = this.#host_name_cache ? 
      this.#host_name_cache :
      (await this.describeIndex()).host;
    
    return this.#host_name_cache;
  }

  /** @type {VectorStore["upsertVectors"]} */
  upsertVectors = async (vectors, documents, options) => {

    /** @type {vector[]} */
    const vectors_pinecone = documents.map(
      (d, ix) => (
        {
          id: d.id,
          metadata: {
            ...d.metadata,
            [NAMESPACE_KEY]: d.namespace
          },
          values: truncate_or_pad_vector(
            vectors[ix], this.config.dimension
          )
        }
      )
    );

    /** @type {upsert_vector_params} */
    const body = {
      vectors: vectors_pinecone
    }

    const r = await fetch(
      `https://${await this.fetchIndexHostName()}/vectors/upsert`,
      {
        method: 'post',
        headers: {
          'Api-Key': this.config.api_key,
          'Content-Type': 'application/x-ndjson'
        },
        body: JSON.stringify(body)
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
      `https://${await this.fetchIndexHostName()}/vectors/delete`,
      {
        method: 'post',
        headers: {
          'Api-Key': this.config.api_key,
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

    const vector = truncate_or_pad_vector(
      embedding_result.content[0], this.config.dimension
    );

    /** @type {query_vectors_params} */
    const body = {
      vector,
      includeMetadata: true,
      includeValues: false,
      topK: k
    }

    if(Array.isArray(namespaces) && namespaces.length) {
      body.filter = {
        [NAMESPACE_KEY]: { $in: namespaces}
      }
    }

    const r = await fetch(
      `https://${await this.fetchIndexHostName()}/query`,
      {
        method: 'post',
        headers: {
          'Api-Key': this.config.api_key,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );

    /** @type {query_vectors_result} */
    const json = await r.json();

    // @ts-ignore
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


  /** @type {Omit<create_vector_index_params, 'name' | 'dimension'>} */
  #default_create_index_params = { metric: 'cosine', spec: { serverless : {cloud: 'aws', region: 'us-east-1' }}} 

  /**
   * 
   * @param {Omit<create_vector_index_params, 'name' | 'dimension'>} [params] 
   * @param {boolean} [delete_index_if_exists_before=false] 
   * @returns {Promise<create_vector_index_result>}
   */
  createVectorIndex = async (
    params=this.#default_create_index_params, 
    delete_index_if_exists_before=false
  ) => {

    if(delete_index_if_exists_before) {
      await this.deleteVectorIndex();
    }

    const r = await fetch(
      'https://api.pinecone.io/indexes',
      {
        method: 'post',
        headers: {
          'Api-Key': this.config.api_key,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify( 
          /** @type {create_vector_index_params} */({
            ...params,
            name: this.config.index_name,
            dimension: this.config.dimension
          })
        )
      }
    );

    /** @type {create_vector_index_result} */
    const json = await r.json();

    // console.log(json)

    return json;
  }

  /**
   * 
   * @returns {Promise<boolean>}
   */
  deleteVectorIndex = async () => {

    const r = await fetch(
      `https://api.pinecone.io/indexes/${this.config.index_name}`,
      {
        method: 'delete',
        headers: {
          'Api-Key': this.config.api_key,
          'Accept': 'application/json'
        }
      }
    );

    return r.ok;
  }

  /**
   * 
   * @returns {Promise<Partial<create_vector_index_result>>}
   */
  describeIndex = async () => {

    const r = await fetch(
      `https://api.pinecone.io/indexes/${this.config.index_name}`,
      {
        method: 'get',
        headers: {
          'Api-Key': this.config.api_key,
          'Accept': 'application/json'
        }
      }
    );

    /** @type {Partial<create_vector_index_result>} */
    const result = await r.json();

    return result;
  }

}