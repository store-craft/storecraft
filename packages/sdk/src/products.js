import { StorecraftSDK } from '../index.js'
import { collection_base } from './utils.api.fetch.js';

/**
 * Base `products` **CRUD**
 * 
 * @extends {collection_base<
 *  import('@storecraft/core/v-api').ProductTypeUpsert, 
 *  import('@storecraft/core/v-api').ProductType>
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
   * @param {string} id 
   * @param {number} howmuch 
   * @returns 
   */
  changeStockOf = async (id, howmuch) => {
    // return this.db.doc(NAME, id).incrementField('qty', howmuch, 0)
  }

  /**
   * Add `products` to `collection`
   * 
   * @param {import('@storecraft/core/v-api').ProductType[]} products 
   * @param {import('@storecraft/core/v-api').CollectionType} collection 
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
   * @param {import('@storecraft/core/v-api').ProductType[]} products 
   * @param {import('@storecraft/core/v-api').CollectionType} collection 
   */
  batchRemoveProductsFromCollection = async (products, collection) => {
    console.log('products', products)
    console.log('collection', collection)
    console.log('(pr.collections??[]).filter(c => c.id!==collection.id)', (products[0].collections??[]).filter(c => c.id!==collection.id))
    for (const pr of products) {
      await this.upsert({
        ...pr,
        collections: (pr.collections??[]).filter(c => c.id!==collection.id)
      });
    }
  }

}