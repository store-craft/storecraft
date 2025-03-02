/**
 * @import { 
 *  AIEmbedder, VectorStore 
 * } from '@storecraft/core/ai/core/types.private.js'
 * @import {
 *  Config
 * } from './types.js'
 * @import { MongoClientOptions } from 'mongodb'
 */

import { MongoClient, ServerApiVersion } from 'mongodb';

export const KEY_PATH = 'embedding';

/**
 * @typedef {VectorStore} Impl
 */

/**
 * @implements {VectorStore}
 */
export class MongoVectorStore {
  /** @type {Config} */
  config;

  /** @type {MongoClient} */
  client

  /**
   * 
   * @param {Config} config 
   */
  constructor(config) {
    this.config = {
      ...config,
      index_name: config.index_name ?? 'vector_store',
      similarity: config.similarity ?? 'cosine',
      options: config.options ?? {
        ignoreUndefined: true,
        serverApi: {
          version: ServerApiVersion.v1,
          strict: false,
          deprecationErrors: true,
        }
      }
    };
    this.client = new MongoClient(
      this.config.url, this.config.options
    );
  }

  /** @type {VectorStore["embedder"]} */
  embedder

  /** @type {VectorStore["addVectors"]} */
  addVectors = async (vectors, documents, options) => {
    
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
  similaritySearch = async (query, k, filter) => {

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
      filter,
      returnMetadata: 'all',
      returnValues: false,
      topK: k
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
   * @param {any} params 
   * @returns {Promise<boolean>}
   */
  createVectorIndex = async (params) => {
    const db = this.client.db(this.config.db_name);
    const collection_name = this.config.index_name;
    // collection name will have the same name as the index
    await db.createCollection(collection_name);
    const index_result = await db.collection(collection_name).createSearchIndex(
      {
        name: this.config.index_name,
        type: 'vectorSearch',
        definition: {
          fields: [
            {
              type: 'vector',
              path: KEY_PATH,
              numDimensions: this.config.dimensions,
              similarity: this.config.similarity
            }
          ]
        }
      }
    );

    if(index_result!==this.config.index_name) {
      throw new Error('MongoVectorStore::createVectorIndex failed');
    }

    return true;
  }

  
}