import { StorecraftAdminSDK } from './index.js'
import { collection_base } from './api.fetch.js';

/**
 * Base `storefronts` **CRUD**
 * 
 * @extends {collection_base<import('@storecraft/core/v-api').StorefrontTypeUpsert, 
 * import('@storecraft/core/v-api').StorefrontType>}
 */
export default class Storefronts extends collection_base {

  /**
   * 
   * @param {StorecraftAdminSDK} sdk 
   */
  constructor(sdk) {
    super(sdk, 'storefronts');
  }

  /**
   * 
   * @param {StorefrontData} sf_data 
   */
  publish = async (sf_data) => {
    sf_data = {...sf_data}
    try {
      // Gather products
      let products = await Promise.all(
        sf_data.products.map(
          async id => await this.context.products.get(id)
        )
      )
      sf_data.products = delete_keys('search', 'createdAt')(
        products.map(p => p[2])
      )
    } catch(e) {
      throw 'products export error: ' + String(e)
    }

    /**
     * @param {Handle[]} sf_data_entry 
     * @param {string} collectionId 
     * @param {(any) => any} filter_fn 
     */
    const collect = async (sf_data_entry, collectionId, filter_fn=_=>true) => {
      try {
        // Gather collections
        const has_all = sf_data_entry?.some(c => c==='ALL')
        let items = []
        if(has_all) {
          items = await this.context[collectionId].list()
          items = items.map(c => c[1]).filter(filter_fn)
        }
        else {
          items = sf_data_entry?.map(
            async id => {
              const [_, __, coll] = await this.context[collectionId].get(id)
              return coll
            }
          )
          items = await Promise.all(items ?? [])     
        }
        items = delete_keys('search')(items)
        return items
      } catch(e) {
        throw `${collectionId} export error: ` + String(e)
      }
    }

    sf_data.collections = await collect(
      sf_data.collections, 'collections',
      c => c?.active || c?.active===undefined
      )
    sf_data.shipping_methods = await collect(
      sf_data.shipping_methods, 'shipping_methods',
      c => c?.active || c?.active===undefined
      )
    sf_data.posts = await collect(
      sf_data.posts, 'posts'
      )
    sf_data.discounts = await collect(
      sf_data.discounts, 'discounts', 
      dis => dis.application.id===DiscountApplicationEnum.Auto.id && dis.enabled
      )

    try {
      // Upload to bucket
      const [url, ref] = await this.context.storage.uploadBytes(
        `storefronts/${sf_data.handle}.json`, 
        pako.gzip(JSON.stringify(sf_data)), 
        {
          contentType: 'application/json',
          contentEncoding: 'gzip',
          // cacheControl: `no-cache`
          cacheControl: `public, max-age=${60*60*1}, must-revalidate`
        }
      )
      await this.update(
        sf_data.handle, 
        { _published: url }
      )

      // console.log(url, ref);
    } catch(e) {
      throw 'Upload export error: ' + String(e)
    }

    console.log('sf_data ', sf_data);
  }

}