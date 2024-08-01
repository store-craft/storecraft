import { StorecraftSDK } from '../index.js'
import { collection_base, fetchApiWithAuth } from './utils.api.fetch.js';
import { filter_fields, filter_unused } from './utils.functional.js';

/**
 * Base `collections` **CRUD**
 * 
 * @extends {collection_base<
 *  import('@storecraft/core/v-api').CollectionTypeUpsert, 
 *  import('@storecraft/core/v-api').CollectionType>
 * }
 */
export default class Collections extends collection_base {

  /**
   * 
   * @param {StorecraftSDK} sdk 
   */
  constructor(sdk) {
    super(sdk, 'collections');
  }

  /**
   * @description Export a collection of `products` into the `storage`. This is
   * beneficial for `collections`, that hardly change and therefore can be 
   * efficiently stored in a cost-effective `storage` and **CDN** network.
   * 
   * @param {string} collection_handle 
   * @param {number} limit 
   */
  publish = async (collection_handle, limit=1000) => {

    const result = await fetchApiWithAuth(
      this.sdk,
      `collections/${collection_handle}/export`,
      {
        method: 'post'
      }
    );

    return result
  }

  // /**
  //  * Add tags in bulk to products in collection
  //  * @param {string} colId 
  //  * @param {string[]} tags 
  //  * @param {boolean} add true for add false for remove 
  //  */
  // bulkAddRemoveTags = async (colId, tags, add=true) => {

  //   // first get all products in collection
  //   const tag_all = tags ?? []
  //   const tag_all_prefixed = tag_all.map(t => `tag:${t}`)
  //   const tag_vs = tag_all.map(it => it.split('_').pop())

  //   var products = await this.context.products.list([`col:${colId}`], 10000)
  //   // console.log('products ', products)
  //   // console.log('colId ', colId)
  //   const batch = writeBatch(this.context.firebase.db)
  //   products.forEach(it => {
  //     const ref = doc(this.context.firebase.db, 'products', it[0])
  //     batch.update(ref, { 
  //       tags : add ? arrayUnion(...tags) : arrayRemove(...tags),
  //       search : add ? arrayUnion(...tag_all, ...tag_all_prefixed, ...tag_vs) : 
  //                      arrayRemove(...tag_all, ...tag_all_prefixed, ...tag_vs),
  //       updatedAt : Date.now()
  //     })
  //   })
  //   await batch.commit()

  // }

}