/**
 * @import { 
 *  ApiQuery, DiscountType, DiscountTypeUpsert, 
 ProductType,
 VariantType
 * } from '@storecraft/core/api'
 */
import { StorecraftSDK } from '../index.js'
import { 
  collection_base, count_query_of_resource, 
  fetchApiWithAuth, 
  list_from_collection_resource 
} from './utils.api.fetch.js';

/**
 * @description Base `discounts` **CRUD**
 * 
 * @extends {collection_base<DiscountTypeUpsert, DiscountType>}
 */
export default class Discounts extends collection_base {

  /**
   * 
   * @param {StorecraftSDK} sdk 
   */
  constructor(sdk) {
    super(sdk, 'discounts');
  }

  /**
   * @description Each discount has eligible products, 
   * you can query and filter these products by discount
   * 
   * @param {string} id_or_handle discount `id` or `handle`
   * @param {ApiQuery<ProductType | VariantType>} query query
   * @return {Promise<(ProductType | VariantType)[]>} List of discounts
   */
  query_discount_products = async (id_or_handle, query) => {
    const result = list_from_collection_resource(
      this.sdk,
      `discounts/${id_or_handle}/products`,
      query
    );
    return result;
  }

  /**
   * @description Each discount has eligible products, 
   * you can count the query products by discount
   * 
   * @param {string} id_or_handle discount `id` or `handle`
   * @param {ApiQuery<ProductType | VariantType>} query query
   * @return {Promise<number>} count
   */
  count_discount_products_query = async (id_or_handle, query) => {
    return count_query_of_resource(
      this.sdk,
      `discounts/${id_or_handle}/products`,
      query
    );
  }

  /**
   * @description List all the tags of products in a collection, This is helpful 
   * for building a filter system in the frontend if you know in advance all 
   * the tags of the products in a collection
   * 
   * @param {string} id_or_handle Discount `id` or `handle`
   * @return {Promise<string[]>} List of tags
   */
  list_used_discount_products_tags = async (id_or_handle) => {
    const result = await fetchApiWithAuth(
      this.sdk,
      `discounts/${id_or_handle}/products/used_tags`,
      {
        method: 'get'
      }
    );

    return result
  }

}