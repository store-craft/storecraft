/**
 * @import { 
 *  AIEmbedder, VectorStore 
 * } from '@storecraft/core/ai/core/types.private.js'
 * @import { ENV } from '@storecraft/core';
 * @import {
 *  Config
 * } from './types.js'
 * @import { 
 *  VectorDocumentUpsert 
 * } from './types.private.js'
 * @import { InArgs } from '@libsql/client';
 */

import * as libsql from "@libsql/client";
import { 
  truncate_or_pad_vector 
} from "@storecraft/core/ai/models/vector-stores/index.js";

export const DEFAULT_INDEX_NAME = 'vector_store';

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
  
  /** @satisfies {ENV<Config>} */
  static EnvConfig = /** @type{const} */ ({
    authToken: 'LIBSQL_VECTOR_AUTH_TOKEN',
    url: 'LIBSQL_VECTOR_URL',
  });

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

  get metric() {
    return this.config.similarity;
  };

  get dimensions() {
    return this.config.dimensions;
  };

  get client() {
    if(!this.config.url) {
      throw new Error('LibSQLVectorStore::client() - missing url');
    }
    
    // @ts-ignore
    this.#client = this.#client ?? libsql.createClient(this.config);

    return this.#client;
  }

  get index_name() {
    return this.config.index_name;
  }

  get table_name() {
    return `${this.index_name}_table`;
  }

  /** @type {VectorStore["onInit"]} */
  onInit = (app) => {
    this.config.authToken ??= app.platform.env[LibSQLVectorStore.EnvConfig.authToken] 
        ?? app.platform.env['LIBSQL_AUTH_TOKEN'];

    this.config.url ??= app.platform.env[LibSQLVectorStore.EnvConfig.url] 
        ?? app.platform.env['LIBSQL_URL'];
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
    );

    /** @type {import("@libsql/client").InStatement[]} */
    const stmts_delete = docs_upsert.map(
      (doc, ix) => (
        {
          sql: `DELETE FROM ${this.table_name} WHERE id=?`,
          args: [doc.id]
        }
      )
    );

    /** @type {import("@libsql/client").InStatement[]} */
    const stmts_insert = docs_upsert.map(
      (doc, ix) => (
        {
          sql: `
          INSERT INTO ${this.table_name} (id, metadata, pageContent, updated_at, namespace, embedding) 
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

    // console.log(vectors)

    return this.upsertVectors(
      vectors, documents, options
    )
  }

  /** @type {VectorStore["delete"]} */
  delete = async (ids) => {
    await this.client.execute(
      {
        sql: `DELETE FROM ${this.table_name} WHERE id IN (${ids.map(id => '?').join(',')})`,
        args: ids
      }
    );
  }

  /** @type {VectorStore["similaritySearch"]} */
  similaritySearch = async (query, k, namespaces) => {
    // console.log({query,k,namespaces})
    
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
    const table = this.table_name;
    const index_name = this.index_name;
    /** @type {InArgs} */
    let args = [];
    let sql = `
    SELECT ${table}.id, metadata, pageContent, updated_at, namespace, ${distance_fn}(embedding, vector(?)) AS score
    FROM vector_top_k('${index_name}', vector(?), CAST(? AS INTEGER)) as top_k_view
    JOIN ${table} ON ${table}.rowid = top_k_view.rowid
    `;

    // console.log(typeof k)
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

    // console.log({result})

    return result.rows.map(
      (row) => (
        {
          document: {
            pageContent: String(row.pageContent),
            id: String(row.id),
            metadata: parse_json_safely(row.metadata),
            namespace: String(row.namespace),
          },
          // `libsql` score is (1 - Cosine Similarity) which yields a distance
          // between [0, 2] where 0 is the most similar.
          // This is not in accordance with other apis, so we invert it to [-1, 1]
          score: (this.metric==='cosine') ? (1.0 - Number(row.score)) : Number(row.score)
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
      `CREATE TABLE IF NOT EXISTS ${this.table_name} (id TEXT, metadata TEXT, pageContent Text, updated_at TEXT, namespace TEXT, embedding F32_BLOB(${this.config.dimensions}));`,
      `CREATE INDEX IF NOT EXISTS ${this.index_name} ON ${this.table_name}(libsql_vector_idx(embedding));`
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
    `DROP INDEX IF EXISTS ${this.index_name}`,
    `DROP TABLE IF EXISTS ${this.table_name}`,
  );

  const result = await this.client.batch(batch);
  return true;
}

  
}

