import { StorecraftAdminSDK } from './index.js'
import { collection_base } from './utils.api.fetch.js';
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
   * @param {StorecraftAdminSDK} sdk 
   */
  constructor(sdk) {
    super(sdk, 'collections');
  }

  /**
   * 
   * @param {string} collection_handle 
   * @param {number} limit 
   */
  publish = async (collection_handle, limit=1000) => {
    throw new Error('Implement me !!!')
    // extra filtering for validation

    try {
      // fetch collection
      var [exists, id, collection] = await this.get(collection_handle)
    } catch (e) {
      throw 'Collection read error: ' + String(e)
    }

    // get all products in collection
    try {
      var pick_data = items => items.map(item => item[1])
      /** @param {ProductData[]} items */
      var filter_hard_on_collection = items => items.filter(
        item => (
          item.collections && 
          item.collections.indexOf(collection_handle)>=0 && 
          item.qty>0 && 
          (item.active || item.active===undefined) &&
          (!item.parent_handle)
        )
      )
      const filter_fields_in = filter_fields(
        'title', 'handle', 'media', 'desc', 'price', 'attributes', 
        'video', 'tags', 'updatedAt', 'compareAtPrice', 'discounts',
        'parent_handle', 'variants_options', 'variants_products'
        )
      var products = await this.context.products.list(
        [`col:${collection_handle}`], limit
        )
      // console.log('products', products)
      products = pick_data(products)
      products = filter_hard_on_collection(products)
      products = filter_fields_in(products)
      products = filter_unused(products)
    } catch (e) {
      throw 'products read error: ' + String(e)
    }

    try {
      // upload collection export
      const metadata = {
        contentType: 'application/json',
        contentEncoding: 'gzip',
        cacheControl: `max-age=${60*60*1}, must-revalidate`
        // cacheControl: `private, max-age=${60*60*1}`
        // cacheControl: `max-age=${60*60*5}, must-revalidate`
      }
      var [url, ref] = await this.context.storage.uploadBytes(
        `collections/${collection_handle}.json`, 
        pako.gzip(
          JSON.stringify({ 
            ...collection, 
            products 
          })
        ), 
        metadata
      )
    } catch(e) {
      throw 'Collection upload error: ' + String(e)
    }

    try {
      await this.update(collection_handle, { _published: url })
    } catch (e) {
      throw 'Collection update error: ' + String(e)
    }
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