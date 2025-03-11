/**
 * @import { ProductTypeUpsert, ProductType, CollectionType } from '@storecraft/core/api'
 */
import { StorecraftSDK } from '../index.js'
import { 
  collection_base, fetchOnlyApiResponseWithAuth 
} from './utils.api.fetch.js';

/**
 * @description Base `products` **CRUD**
 * 
 * @extends {collection_base<ProductTypeUpsert, ProductType>}
 */
export default class Products extends collection_base {

  /**
   * 
   * @param {StorecraftSDK} sdk 
   */
  constructor(sdk) {
    super(sdk, 'products');
  }

  /**
   * 
   * Change stock quantity of a `product` by a delta difference
   * number.
   * 
   * @param {string} id_or_handle `id` ot `handle`
   * @param {number} howmuch a diff number by how much to update stock
   */
  changeStockOfBy = async (id_or_handle, howmuch) => {
    const response = await fetchOnlyApiResponseWithAuth(
      this.sdk,
      `products/${id_or_handle}?quantityBy=${howmuch}`,
      {
        method: 'put'
      }
    );

    return response.ok;
  }

  /**
   * Add `products` to `collection`
   * 
   * @param {ProductType[]} products 
   * @param {CollectionType} collection 
   */
  batchAddProductsToCollection = async (products, collection) => {
    for (const pr of products) {
      await this.upsert({
        ...pr,
        collections: [...(pr.collections??[]), collection]
      });
    }
  }

  /**
   * Remove `products` from `collection`
   * 
   * @param {ProductType[]} products 
   * @param {CollectionType} collection 
   */
  batchRemoveProductsFromCollection = async (products, collection) => {
    for (const pr of products) {
      await this.upsert({
        ...pr,
        collections: (pr.collections??[]).filter(c => c.id!==collection.id)
      });
    }
  }

}