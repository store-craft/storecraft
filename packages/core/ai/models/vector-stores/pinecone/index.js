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
 */

export const NAMESPACE_KEY = '__namespace'
export const ENV_PINECONE_API_KEY = 'PINECONE_API_KEY'

/**
 * @implements {VectorStore}
 */
export class Pinecone {
  /**
   * 
   * @param {Config} config 
   */
  constructor(config) {
    this.config = config;
  }

  /** @type {VectorStore["onInit"]} */
  onInit = (app) => {
    this.config.api_key = this.config.api_key ?? app.platform.env[ENV_PINECONE_API_KEY]; 
  }

  /** @type {VectorStore["embedder"]} */
  get embedder() {
    return this.config.embedder
  }

  /** @type {VectorStore["addVectors"]} */
  addVectors = async (vectors, documents, options) => {

    /** @type {vector[]} */
    const vectors_pinecone = documents.map(
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

    /** @type {upsert_vector_params} */
    const body = {
      vectors: vectors_pinecone
    }

    const r = await fetch(
      `https://${this.config.index_host}/vectors/upsert`,
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
      `https://${this.config.index_host}/vectors/delete`,
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
    const vector = embedding_result.content[0]

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
      `https://${this.config.index_host}/query`,
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
   * @param {create_vector_index_params} params 
   * @returns {Promise<create_vector_index_result>}
   */
  createVectorIndex = async (params) => {

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
            name: params.name
          })
        )
      }
    );

    /** @type {create_vector_index_result} */
    const json = await r.json();

    return json;
  }

}