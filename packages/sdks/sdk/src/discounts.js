/**
 * @import { 
 *  ApiQuery, DiscountType, DiscountTypeUpsert 
 * } from '@storecraft/core/api'
 */
import { StorecraftSDK } from '../index.js'
import { 
  collection_base, count_query_of_resource, 
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
   * @param {ApiQuery<DiscountType>} query query
   * @return {Promise<DiscountType[]>} List of discounts
   */
  query_customer_orders = async (id_or_handle, query) => {
    const result = list_from_collection_resource(
      this.sdk,
      `discounts/${id_or_handle}/products`,
      query
    );
    return result
  }

  /**
   * @description Each discount has eligible products, 
   * you can count the query products by discount
   * 
   * @param {string} id_or_handle discount `id` or `handle`
   * @param {ApiQuery<DiscountType>} query query
   * @return {Promise<number>} count
   */
  count_customer_orders_query = async (id_or_handle, query) => {
    return count_query_of_resource(
      this.sdk,
      `discounts/${id_or_handle}/products`,
      query
    );
  }

}