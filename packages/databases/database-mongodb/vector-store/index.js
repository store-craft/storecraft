/**
 * @import { 
 *  AIEmbedder, VectorStore 
 * } from '@storecraft/core/ai/core/types.private.js'
 * @import {
 *  Config
 * } from './types.js'
 * @import {
mongo_vectorSearch_pipeline,
 *  MongoVectorDocument
 * } from './types.private.js'
 * 
 * @import { 
 *  AnyBulkWriteOperation, Document, AggregationCursor 
 * } from 'mongodb'
 * @import { ENV } from '@storecraft/core';
 */
import { Collection } from 'mongodb';
import { MongoClient, ServerApiVersion } from 'mongodb';

export const EMBEDDING_KEY_PATH = 'embedding';
export const NAMESPACE_KEY = 'namespace';
export const DEFAULT_INDEX_NAME = 'vector_store';

/**
 * @typedef {VectorStore} Impl
 */

/**
 * @description MongoDB Atlas Vector Store
 * {@link https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-type/#:~:text=You%20can%20use%20the%20vectorSearch,to%20pre%2Dfilter%20your%20data.}
 * @implements {VectorStore}
 */
export class MongoVectorStore {

  /** @satisfies {ENV<Config>} */
  static EnvConfig = /** @type {const} */ ({
    db_name: 'MONGODB_VECTOR_STORE_DB_NAME',
    url: 'MONGODB_VECTOR_STORE_URL'
  });

  /** @type {Config} */
  config;

  /** @type {MongoClient} */
  #client

  /**
   * 
   * @param {Config} config 
   */
  constructor(config) {
    this.config = {
      index_name: DEFAULT_INDEX_NAME,
      similarity: 'cosine',
      dimensions: 1536,
      options: {
        ignoreUndefined: true,
        serverApi: {
          version: ServerApiVersion.v1,
          strict: false,
          deprecationErrors: true,
        }
      },
      ...config,
    };
  }

  /** @type {VectorStore["metric"]} */
  get metric() {
    switch(this.config.similarity) {
      case 'cosine': return 'cosine';
      case 'dotProduct': return 'dotproduct';
      case 'euclidean': return 'euclidean';
    }
  };

  /** @type {VectorStore["dimensions"]} */
  get dimensions() {
    return this.config.dimensions;
  };

  get client() {
    if(!this.config.db_name || !this.config.url) {
      throw new Error('MongoVectorStore::client() - missing url or db_name');
    }
    
    this.#client = this.#client ?? new MongoClient(
      this.config.url, this.config.options
    );
    return this.#client;
  }

  /** @type {VectorStore["onInit"]} */
  onInit = (app) => {
    this.config.url ??= app.platform.env[MongoVectorStore.EnvConfig.url] 
      ?? app.platform.env['MONGODB_URL']; 
    this.config.db_name ??= app.platform.env[MongoVectorStore.EnvConfig.db_name] 
      ?? app.platform.env['MONGODB_DB_NAME'] ?? 'main'; 
  }

  /** @type {VectorStore["embedder"]} */
  get embedder() {
    return this.config.embedder
  }

  /** @type {Collection<MongoVectorDocument>} */
  get vector_collection() {
    return this.client.db(this.config.db_name).collection(this.config.index_name);
  }

  /** @type {VectorStore["upsertVectors"]} */
  upsertVectors = async (vectors, documents, options) => {
    /** @type {MongoVectorDocument[]} */
    const mongo_docs = documents.map(
      (doc, ix) => (
        {
          updated_at: new Date().toISOString(),
          embedding: vectors[ix],
          metadata: doc.metadata,
          pageContent: doc.pageContent,
          [NAMESPACE_KEY]: doc.namespace,
          id: doc.id
        }
      )
    );

    // upsert all docs
    /** @type {AnyBulkWriteOperation<MongoVectorDocument>[]} */
    const mongo_replace_ops = mongo_docs.map(
      (doc) => (
        {
          replaceOne: {
            filter: {
              id: doc.id
            },
            replacement: doc,
            upsert: true
          }
        }
      )
    )

    const results = await this.vector_collection.bulkWrite(
      mongo_replace_ops
    );

  }

  /** @type {VectorStore["upsertDocuments"]} */
  upsertDocuments = async (documents, options) => {
    // first, generate embeddings for the documents
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

    if(!result) {
      console.warn(
        'MongoVectoreStore::upsertDocuments() - no result from embedder'
      );
      return;
    }

    const vectors = result.content;

    return this.upsertVectors(
      vectors, documents, options
    )
  }

  /** @type {VectorStore["delete"]} */
  delete = async (ids) => {
    const result = await this.vector_collection.deleteMany(
      {
        id: { $in: ids }
      }
    );
    
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

    const agg = [
      {
        '$vectorSearch': /** @type {mongo_vectorSearch_pipeline} */ ({
          index: this.config.index_name,
          path: EMBEDDING_KEY_PATH,
          queryVector: vector,
          numCandidates: k,
          limit: k,
          exact: false,
        })
      }, {
        '$project': {
          '_id': 0,
          [EMBEDDING_KEY_PATH]: 0,
          'score': {
            '$meta': 'vectorSearchScore'
          }
        }
      }
    ];

    if(Array.isArray(namespaces) && namespaces.length) {
      agg[0].$vectorSearch.filter = {
        [NAMESPACE_KEY]: {$in: namespaces}
      }
    }

    /** @type {AggregationCursor<MongoVectorDocument>} */
    const agg_result = this.vector_collection.aggregate(agg);
    const mongo_vector_docs = await agg_result.toArray();

    return mongo_vector_docs.map(
      (doc) => {
        return {
          score: doc.score,
          document: {
            id: doc.id,
            metadata: /** @type {any}*/ (doc.metadata),
            pageContent: doc.pageContent,
            namespace: doc.namespace
          }
        }
      }
    );
  }

  /**
   * @param {boolean} [disconnect_after_finish=true] 
   * @param {boolean} [delete_index_if_exists_before=false] 
   * @returns {Promise<boolean>}
   */
  createVectorIndex = async (
    disconnect_after_finish=true, 
    delete_index_if_exists_before=false
  ) => {
    if(delete_index_if_exists_before) {
      await this.deleteVectorIndex();
    }
    
    const db = this.client.db(this.config.db_name);
    const collection_name = this.config.index_name;

    { // skip if index already exists
      const indices = await db
      .collection(collection_name)
      .listSearchIndexes()
      .toArray();

      if(indices?.length) {
        const index = indices.find(
          (index) => index.name === this.config.index_name
        );
        if(index) {
          console.log('MongoVectorStore::createVectorIndex - index already exists, skipping');
          return true;
        }
      }
    }

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
              path: EMBEDDING_KEY_PATH,
              numDimensions: this.config.dimensions,
              similarity: this.config.similarity
            },
            {
              type: 'filter',
              path: NAMESPACE_KEY
            },
          ]
        }
      }
    );

    if(index_result!==this.config.index_name) {
      throw new Error('MongoVectorStore::createVectorIndex failed');
    }

    if(disconnect_after_finish)
      await this.client.close();

    return true;
  }

  /**
   * @returns {Promise<boolean>}
   */
  deleteVectorIndex = async () => {
    const db = this.client.db(this.config.db_name);
    const collection_name = this.config.index_name;
    const index_result = await db.collection(collection_name).dropSearchIndex(
      this.config.index_name
    );

    return true;
  }  
  
}

