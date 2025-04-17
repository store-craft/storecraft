/**
 * @import { 
 *  ApiQuery, CollectionType, CollectionTypeUpsert, ProductType, VariantType 
 * } from '@storecraft/core/api'
 */
import { StorecraftSDK } from '../index.js'
import { 
  collection_base, count_query_of_resource, 
  fetchApiWithAuth, list_from_collection_resource 
} from './utils.api.fetch.js';

/**
 * @description Base `collections` **CRUD**
 * 
 * @extends {collection_base<CollectionTypeUpsert, CollectionType>}
 */
export default class Collections extends collection_base {

  /**
   * @param {StorecraftSDK} sdk 
   */
  constructor(sdk) {
    super(sdk, 'collections');
  }

  /**
   * @description Export a collection of `products` into the `storage`. This is
   * beneficial for `collections`, that hardly change and therefore can be 
   * efficiently stored in a cost-effective `storage` and **CDN** network.
   * @param {string} collection_handle 
   * @param {number} limit 
   */
  publish = async (collection_handle, limit=1000) => {
    const result = await fetchApiWithAuth(
      this.sdk,
      `collections/${collection_handle}/export`,
      {
        method: 'post'
      }
    );
    return result
  }

  /**
   * @description List all the tags of products in a collection, This is helpful 
   * for building a filter system in the frontend if you know in advance all 
   * the tags of the products in a collection
   * @param {string} id_or_handle Collection `id` or `handle`
   * @return {Promise<string[]>} List of tags
   */
  list_used_products_tags = async (id_or_handle) => {
    const result = await fetchApiWithAuth(
      this.sdk,
      `collections/${id_or_handle}/products/used_tags`,
      {
        method: 'get'
      }
    );

    return result
  }

  /**
   * @description Query the `products` in a collection
   * @param {string} id_or_handle Collection `id` or `handle`
   * @param {ApiQuery<(ProductType | VariantType)>} query query
   * @return {Promise<(ProductType | VariantType)[]>} List of products in collection
   */
  query_collection_products = async (id_or_handle, query) => {
    const result = list_from_collection_resource(
      this.sdk,
      `collections/${id_or_handle}/products`,
      query
    );
    return result
  }

  /**
   * @description Count the number of `products` in a collection by a query
   * @param {string} id_or_handle Collection `id` or `handle`
   * @param {ApiQuery<(ProductType | VariantType)>} query query
   * @return {Promise<number>} count
   */
  count_collection_products_query = async (id_or_handle, query) => {
    return count_query_of_resource(
      this.sdk,
      `collections/${id_or_handle}/products`,
      query
    );
  }

}