import { StorecraftAdminSDK } from './index.js'
import { collection_base } from './utils.api.fetch.js';

/**
 * Base `products` **CRUD**
 * 
 * @extends {collection_base<import('@storecraft/core/v-api').ProductTypeUpsert, 
 * import('@storecraft/core/v-api').ProductType>}
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

  /**
   * @todo change it to array of ids
   * @param {[string, ProductData][]} products array of tuples [[id, product_data],...]
   * @param {string} collectionId 
   */
  batchAddProductsToCollection = async (products, collectionId) => {
    try {
      // add collection tag to each product with batch write
      const batch = writeBatch(this.context.firebase.db)
      products.forEach(it => {
        const ref = doc(this.context.firebase.db, 'products', it[0])
        batch.update(ref, { 
          collections : arrayUnion(collectionId),
          search : arrayUnion(`col:${collectionId}`),
          updatedAt : Date.now()
        })
      })
      await batch.commit()
    } catch (e) {
      throw 'Products update failed: ' + String(e)
    }
  }

  /**
   * 
   * @param {string[]} products_Ids 
   * @param {string} collectionId 
   */
  batchRemoveProductsFromCollection = async (products_Ids, collectionId) => {
    try {
      // add collection tag to each product with batch write
      const batch = writeBatch(this.context.firebase.db)
      products_Ids.forEach(id => {
        const ref = doc(this.context.firebase.db, 'products', id)
        batch.update(ref, { 
          collections : arrayRemove(collectionId),
          search : arrayRemove(`col:${collectionId}`),
          updatedAt : Date.now()
        })
      })
      await batch.commit()
    } catch (e) {
      console.log(e);
      throw 'Products update failed: ' + String(e)
    }

  }

}