/**
 * @import { 
 *  AIEmbedder, VectorStore 
 * } from '@storecraft/core/ai/core/types.private.js'
 * @import {
 *  Config
 * } from './types.js'
 * @import { 
 *  create_vector_index_params, VectorDocumentUpsert 
 * } from './types.private.js'
 * @import { InArgs } from '@libsql/client';
 */

import * as libsql from "@libsql/client";
import { truncate_or_pad_vector } from "@storecraft/core/ai/models/vector-stores/index.js";

export const DEFAULT_INDEX_NAME = 'vector_store';
export const ENV_LIBSQL_AUTH_TOKEN = 'LIBSQL_AUTH_TOKEN';
export const ENV_LIBSQL_URL = 'LIBSQL_URL';

/** @param {any} json */
const parse_json_safely = json => {
  try {
    return JSON.parse(json);
  } catch (e) {
    return {};
  } finally {
  }
}

/**
 * Implementation referenes:
 * - https://docs.turso.tech/features/ai-and-embeddings#vectors-usage
 * - https://github.com/langchain-ai/langchainjs/blob/9dfaae7e36a1ddce586b9c44fb96785fa38b36ec/libs/langchain-community/src/vectorstores/libsql.ts
 */

/**
 * @typedef {VectorStore} Impl
 */

/**
 * @description LibSQL / Turso Vector Store
 * 
 * @implements {VectorStore}
 */
export class LibSQLVectorStore {

  /** @type {Config} */
  config;

  /** @type {libsql.Client} */
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
      ...config,
    };
  }

  get client() {
    if(!this.config.url) {
      throw new Error('LibSQLVectorStore::client() - missing url');
    }
    
    // @ts-ignore
    this.#client = this.#client ?? libsql.createClient(this.config);

    return this.#client;
  }

  /** @type {VectorStore["onInit"]} */
  onInit = (app) => {
    this.config.authToken = this.config.authToken ?? app.platform.env[ENV_LIBSQL_AUTH_TOKEN];
    this.config.url = this.config.url ?? app.platform.env[ENV_LIBSQL_URL];
  }

  /** @type {VectorStore["embedder"]} */
  get embedder() {
    return this.config.embedder
  }
  // (id TEXT, metadata TEXT, pageContent Text, updated_at TEXT, namespace TEXT, embedding F32_BLOB
  /** @type {VectorStore["upsertVectors"]} */
  upsertVectors = async (vectors, documents, options) => {
    const updated_at = new Date().toISOString();
    /** @type {VectorDocumentUpsert[]} */
    const docs_upsert = documents.map(
      (doc, ix) => (
        {
          embedding: `[${truncate_or_pad_vector(vectors[ix], this.config.dimensions).join(',')}]`,
          id: doc.id,
          metadata: JSON.stringify(doc.metadata ?? {}),
          pageContent: doc.pageContent,
          updated_at,
          namespace: doc.namespace,
        }
      )
    )

    /** @type {import("@libsql/client").InStatement[]} */
    const stmts_delete = docs_upsert.map(
      (doc, ix) => (
        {
          sql: `DELETE FROM ${this.config.index_name} WHERE id=?`,
          args: [doc.id]
        }
      )
    );

    /** @type {import("@libsql/client").InStatement[]} */
    const stmts_insert = docs_upsert.map(
      (doc, ix) => (
        {
          sql: `
          INSERT INTO ${this.config.index_name} (id, metadata, pageContent, updated_at, namespace, embedding) 
          VALUES (:id, :metadata, :pageContent, :updated_at, :namespace, vector(:embedding))
          `,
          args: doc
        }
      )
    );

    const result = await this.client.batch(
      [
        ...stmts_delete,
        ...stmts_insert,
      ]
    );

    console.log(result);
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

    const vectors = result.content;

    return this.upsertVectors(
      vectors, documents, options
    )
  }

  /** @type {VectorStore["delete"]} */
  delete = async (ids) => {
    await this.client.execute(
      {
        sql: `DELETE FROM ${this.config.index_name} WHERE id IN (${ids.map(id => '?').join(',')})`,
        args: ids
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
    const vector = truncate_or_pad_vector(
      embedding_result.content[0], this.config.dimensions
    );
    const vector_sql_value = `[${vector.join(',')}]`
    const distance_fn = this.config.similarity==='cosine' ? 'vector_distance_cos' : 'vector_distance_l2'
    // SELECT title, year
    // FROM vector_top_k('movies_idx', vector32('[0.064, 0.777, 0.661, 0.687]'), 3)
    // JOIN movies ON movies.rowid = id
    // WHERE year >= 2020;    
    const table = this.config.index_name;
    const index_name = this.config.index_name;
    /** @type {InArgs} */
    let args = [];
    let sql = `
    SELECT id, metadata, pageContent, updated_at, namespace, ${distance_fn}(embedding, vector(?)) AS score
    FROM vector_top_k('${index_name}', vector(?), ?) as top_k_view
    JOIN ${table} ON ${table}.rowid = top_k_view.id
    `;
    args.push(vector_sql_value, vector_sql_value, k);

    if(Array.isArray(namespaces) && namespaces.length) {
      sql += `\nWHERE namespace IN (${namespaces.map(n => '?').join(',')})`
      args.push(...namespaces);
    }

    sql += `
    ORDER BY
       ${distance_fn}(embedding, vector(?))
    ASC;
    `
    args.push(vector_sql_value);


    const result = await this.client.execute({ sql, args });

    return result.rows.map(
      (row) => (
        {
          document: {
            pageContent: String(row.pageContent),
            id: String(row.id),
            metadata: parse_json_safely(row.metadata),
            namespace: String(row.namespace),
          },
          score: Number(row.score)
        }
      )
    );

  }


  /**
   * 
   * @param {boolean} [delete_index_if_exists_before=false] 
   * @returns {Promise<boolean>}
   */
  createVectorIndex = async (delete_index_if_exists_before=false) => {

    /** @type {string[]} */
    const batch = [];

    if(delete_index_if_exists_before) {
      await this.deleteVectorIndex();
    }

    batch.push(
      `CREATE TABLE IF NOT EXISTS ${this.config.index_name} (id TEXT, metadata TEXT, pageContent Text, updated_at TEXT, namespace TEXT, embedding F32_BLOB(${this.config.dimensions}));`,
      `CREATE INDEX IF NOT EXISTS ${this.config.index_name} ON ${this.config.index_name}(libsql_vector_idx(embedding));`
    );

    const result = await this.client.batch(batch);
    return true;
  }

/**
   * 
   * @returns {Promise<boolean>}
   */
deleteVectorIndex = async () => {

  /** @type {string[]} */
  const batch = [];

  batch.push(
    `DROP INDEX IF EXISTS ${this.config.index_name}`,
    `DROP TABLE IF EXISTS ${this.config.index_name}`,
  );

  const result = await this.client.batch(batch);
  return true;
}

  
}

