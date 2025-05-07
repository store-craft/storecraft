/**
 * @import { 
 *  ApiQuery, CustomerType, CustomerTypeUpsert, OrderData 
 * } from '@storecraft/core/api'
 */
import { StorecraftSDK } from '../index.js'
import { 
  collection_base, count_query_of_resource, 
  list_from_collection_resource 
} from './utils.api.fetch.js';

/**
 * @description Base `customers` **CRUD**
 * @extends {collection_base<CustomerTypeUpsert, CustomerType>}
 */
export default class Customers extends collection_base {

  /**
   * 
   * @param {StorecraftSDK} sdk 
   */
  constructor(sdk) {
    super(sdk, 'customers');
  }

  /**
   * @description Query customer orders, this is only available to admin and 
   * the customer (with auth token)
   * @param {string} id_or_handle customer `id` or `handle` or `email`
   * @param {ApiQuery<OrderData>} query query
   * @return {Promise<OrderData[]>} List of orders of customer
   */
  query_customer_orders = async (id_or_handle, query) => {
    const result = list_from_collection_resource(
      this.sdk,
      `customers/${id_or_handle}/orders`,
      query
    );
    return result
  }

  /**
   * @description Count the number of orders of a specific
   * customer with a query
   * @param {string} id_or_handle customer `id` or `handle` or `email`
   * @param {ApiQuery<OrderData>} query query
   * @return {Promise<number>} count
   */
  count_customer_orders_query = async (id_or_handle, query) => {
    return count_query_of_resource(
      this.sdk,
      `customers/${id_or_handle}/orders`,
      query
    );
  }
}