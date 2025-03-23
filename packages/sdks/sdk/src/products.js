/**
 * @import { ProductTypeUpsert, ProductType, CollectionType } from '@storecraft/core/api'
 */
import { StorecraftSDK } from '../index.js'
import { 
  collection_base, fetchApiWithAuth, fetchOnlyApiResponseWithAuth 
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
   * @description List all of the tags of all the products deduped, 
   * This is helpful for building a filter system in the frontend if 
   * you know in advance all the tags of the products in a collection, 
   * also see the collection confined version db_collections.list_collection_products_tags
   * 
   * @return {Promise<string[]>} List of tags
   */
  list_all_tags = async () => {
    const result = await fetchApiWithAuth(
      this.sdk,
      `products/all_tags`,
      {
        method: 'get'
      }
    );

    return result
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