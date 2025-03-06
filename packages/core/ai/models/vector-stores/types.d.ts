export type * from '../../core/types.vector-store.d.ts';

export type StorecraftVectorMetaData = {
  /** JSON of a product | collection | shipping | discount */
  json: string,
  /** handle of entity */
  handle: string,
  /** id of entity */
  id: string,
  /** JSON summary of the embedder model */
  embedder_tag_json: string
}

/**
 * @description Allowed namespaces for vectors
 */
export type vector_namespaces = 'products' | 'discounts' | 'collections' | 'shipping';

