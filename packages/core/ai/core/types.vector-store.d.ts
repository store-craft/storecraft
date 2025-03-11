import { App } from "../../types.public.js";
import { AIEmbedder } from "./types.embedder.js";

export interface VectorStoreDocumentInterface<
  Metadata extends Record<string, string | number | boolean> = Record<string, string | number | boolean>
> {
  pageContent: string;
  metadata?: Metadata;

  /**
   * @description used to filter results by a category, for example 'products' | 'discounts' etc..
   */
  namespace?: string;

  /**
   * An optional identifier for the document.
   *
   * Ideally this should be unique across the document collection and formatted
   * as a UUID, but this will not be enforced.
   */
  id?: string;
}

export type VectorStoreSimilaritySearchQueryResult<
  Metadata extends Record<string, string | number | boolean> = Record<string, string | number | boolean>
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
   * Adds precomputed vectors and corresponding documents to the vector store.
   *
   * @param vectors - An array of vectors representing each document.
   * @param documents - Array of documents associated with each vector.
   * @param options - Optional configuration for adding vectors, such as indexing.
   * @returns A promise resolving to an array of document IDs or void, based on implementation.
   * @abstract
   */
  abstract upsertVectors(
    vectors: number[][],
    documents: VectorStoreDocumentInterface[],
    options?: VectorStoreAddDocumentOptions
  ): Promise<string[] | void>;

  /**
   * Adds documents to the vector store, embedding them first through the
   * `embeddings` instance.
   *
   * @param documents - Array of documents to embed and add.
   * @param options - Optional configuration for embedding and storing documents.
   * @returns A promise resolving to an array of document IDs or void, based on implementation.
   * @abstract
   */
  abstract upsertDocuments(
    documents: VectorStoreDocumentInterface[],
    options?: VectorStoreAddDocumentOptions
  ): Promise<string[] | void>;

  /**
   * Deletes documents from the vector store based on the specified parameters.
   *
   * @param ids - array of ids.
   * @returns A promise that resolves once the deletion is complete.
   */
  async delete(ids: string[]): Promise<void>;

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
  async similaritySearch<
    Metadata extends Record<string, string | number | boolean> = Record<string, string | number | boolean>
  >(
    query: string,
    k = 4,
    namespaces?: string[],
  ): Promise<VectorStoreSimilaritySearchQueryResult<Metadata>[]>;

}