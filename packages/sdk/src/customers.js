/**
 * @import { CustomerType, CustomerTypeUpsert } from '@storecraft/core/api'
 */
import { StorecraftSDK } from '../index.js'
import { collection_base } from './utils.api.fetch.js';

/**
 * @description Base `customers` **CRUD**
 * 
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
}