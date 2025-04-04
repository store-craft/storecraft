/**
 * @import { 
 *  AIEmbedder, VectorStore 
 * } from '../../../core/types.private.js'
 * @import {
 *  DummyStoreEntry
 * } from './types.private.js'
 */

import { DummyEmbedder } from '../../embedders/dummy/index.js';
import { truncate_or_pad_vector } from '../index.js';

export const NAMESPACE_KEY = '__namespace';

/**
 * @implements {VectorStore}
 */
export class DummyVectorStore {

  /** @type {Record<string, DummyStoreEntry>} */
  docs;
  /** @type {Record<string, number[]>} */
  embeddings;
  /** @type {DummyEmbedder} */
  #embedder

  constructor() {
    this.docs = {};
    this.embeddings = {};
    this.#embedder = new DummyEmbedder();
  }

  /** @type {VectorStore["metric"]} */
  get metric() {
    return /** @type {const} */ ('cosine');
  };

  /** @type {VectorStore["dimensions"]} */
  get dimensions() {
    return 1024;
  };


  /** @type {VectorStore["onInit"]} */
  onInit = (app) => {
  }

  /** @type {VectorStore["embedder"]} */
  get embedder() {
    return this.#embedder;
  }

  /** @type {VectorStore["upsertVectors"]} */
  upsertVectors = async (vectors, documents, options) => {

    for (const [ix, vector] of vectors.entries()) {
      const doc = documents[ix];
      this.docs[doc.id] = doc;
      this.embeddings[doc.id] = vector;
    }

    return documents.map(
      doc => doc.id
    );
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
    for (const id of ids) {
      delete this.docs[id];
      delete this.embeddings[id];
    }
  }

  /**
   * 
   * @param {number[]} a 
   * @param {number[]} b 
   * @returns {number}
   */
  #consine_similarity = (a, b) => {
    const dot = a.reduce(
      (acc, val, ix) => acc + val * b[ix], 0
    );
    const norm_a = Math.sqrt(
      a.reduce(
        (acc, val) => acc + val * val, 0
      )
    );
    const norm_b = Math.sqrt(
      b.reduce(
        (acc, val) => acc + val * val, 0
      )
    );
    return dot / (norm_a * norm_b);
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
      embedding_result.content[0], this.dimensions
    );

    let matches = Object.entries(this.embeddings).map(
      ([id, v]) => {
        const score = this.#consine_similarity(vector, v);
        return { id, score }
      }
    )
    .sort(
      (a, b) => b.score - a.score
    );

    if(namespaces?.length > 0) {
      matches = matches.filter(
        ({id, score}) => namespaces.includes(this.docs[id].namespace)
      )
    }

    matches = matches.slice(0, k);

    // @ts-ignore
    return matches.map(
      match => ({
        score: match.score,
        document: this.docs[match.id],

      })
    );
  }

  /**
   * @type {VectorStore["createVectorIndex"]}
   */
  createVectorIndex = async (
  ) => {
  }

}

