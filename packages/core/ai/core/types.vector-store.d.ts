import { App } from "../../types.public.js";
import { AIEmbedder } from "./types.embedder.js";

export type RegularValue = string | number | boolean;

export interface VectorStoreDocumentInterface<
  Metadata extends Record<string, RegularValue> = Record<string, RegularValue>
> {
  /**
   * @description The Text that was embedded.
   */
  pageContent: string;

  /**
   * @description The metadata associated with the document. 
   * You can store JSONs for example or TAGS
   */
  metadata?: Metadata;

  /**
   * @description used to filter results by a category, 
   * for example 'products' | 'discounts' etc..
   */
  namespace?: string;

  /**
   * An optional identifier for the document.
   *
   * Ideally this should be unique across the document 
   * collection and formatted as a UUID, but this will 
   * not be enforced.
   */
  id?: string;
}

export type VectorStoreSimilaritySearchQueryResult<
  Metadata extends Record<string, RegularValue> = Record<string, RegularValue>
> = {
  document: VectorStoreDocumentInterface<Metadata>,
  score: number
}

/**
 * Type for options when adding a document to the VectorStore.
 */
export type VectorStoreAddDocumentOptions = Record<string, any>;


export interface VectorStore<
  Embedder extends AIEmbedder = AIEmbedder
> {
  embedder: Embedder;

  /**
   * @description Your chance to read `env` variable for the config
   * @param app `storecraft` app instance
   */
  onInit?: (app: App) => any | void;

  /**
   * @description The metric used to 
   * - build an index.
   * - calculate similarity between vectors.
   */
  metric: 'cosine' | 'euclidean' | 'dotproduct';

  /**
   * @description The dimensions of the vectors to be inserted in the index.
   */
  dimensions: number;

  /**
   * Adds precomputed vectors and corresponding documents to the vector store.
   *
   * @param vectors - An array of vectors representing each document.
   * @param documents - Array of documents associated with each vector.
   * @param options - Optional configuration for adding vectors, such as indexing.
   * @returns A promise resolving to an array of document IDs or void, 
   * based on implementation.
   * @abstract
   */
  upsertVectors(
    vectors: number[][],
    documents: VectorStoreDocumentInterface[],
    options?: VectorStoreAddDocumentOptions
  ): Promise<string[] | void>;

  /**
   * @description Adds documents to the vector store, embedding them 
   * first through the `embeddings` instance.
   * @param documents - Array of documents to embed and add.
   * @param options - Optional configuration for embedding and storing documents.
   * @returns A promise resolving to an array of document IDs or void, 
   * based on implementation.
   * @abstract
   */
  upsertDocuments(
    documents: VectorStoreDocumentInterface[],
    options?: VectorStoreAddDocumentOptions
  ): Promise<string[] | void>;

  /**
   * Deletes documents from the vector store based on the 
   * specified parameters.
   * @param ids - array of ids.
   * @returns A promise that resolves once the deletion is complete.
   */
  delete(ids: string[]): Promise<void>;

  /**
   * Searches for documents similar to a text query by embedding the query and
   * performing a similarity search on the resulting vector.
   *
   * @param query - Text query for finding similar documents.
   * @param k - Number of similar results to return. Defaults to 4.
   * @param namespaces - Optional filter based on namespaces.
   * @returns A promise resolving to an array of 
   * `DocumentInterface` instances representing similar documents.
   */
  similaritySearch<
    Metadata extends Record<string, RegularValue> = Record<string, RegularValue>
  >(
    query: string,
    k:number,
    namespaces?: string[],
  ): Promise<VectorStoreSimilaritySearchQueryResult<Metadata>[]>;

  /**
   * @description Create the vector index
   * @param params extra parameters
   * @param delete_index_if_exists_before 
   */
  createVectorIndex(
    params?: any, 
    delete_index_if_exists_before?: boolean
  ): Promise<any>
}