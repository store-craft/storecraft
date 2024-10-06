import { StorecraftSDK } from '../index.js'
import { 
  collection_base, fetchOnlyApiResponseWithAuth 
} from './utils.api.fetch.js';

/**
 * @description Base `products` **CRUD**
 * 
 * @extends {collection_base<
 *  import('@storecraft/core/api').ProductTypeUpsert, 
 *  import('@storecraft/core/api').ProductType>
 * }
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
   * @param {import('@storecraft/core/api').ProductType[]} products 
   * @param {import('@storecraft/core/api').CollectionType} collection 
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
   * @param {import('@storecraft/core/api').ProductType[]} products 
   * @param {import('@storecraft/core/api').CollectionType} collection 
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