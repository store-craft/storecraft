import { StorecraftAdminSDK } from './index.js'
import { collection_base } from './api.fetch.js';

/**
 * Base `products` **CRUD**
 * 
 * @extends {collection_base<import('@storecraft/core/v-api').ProductTypeUpsert ,import('@storecraft/core/v-api').ProductType>}
 */
export default class Products extends collection_base {

  /**
   * 
   * @param {StorecraftAdminSDK} sdk 
   */
  constructor(sdk) {
    super(sdk, 'products');
  }

  /**
   * 
   * @param {string} id 
   * @param {number} howmuch 
   * @returns 
   */
  changeStockOf = (id, howmuch) => {
    // return this.db.doc(NAME, id).incrementField('qty', howmuch, 0)
  }

}