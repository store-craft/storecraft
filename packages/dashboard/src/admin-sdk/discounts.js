import { StorecraftAdminSDK } from './index.js'
import { collection_base } from './utils.api.fetch.js';

/**
 * Base `discounts` **CRUD**
 * 
 * @extends {collection_base<import('@storecraft/core/v-api').DiscountTypeUpsert, 
 * import('@storecraft/core/v-api').DiscountType>}
 */
export default class Discounts extends collection_base {

  /**
   * 
   * @param {StorecraftAdminSDK} sdk 
   */
  constructor(sdk) {
    super(sdk, 'discounts');
  }

  /**
   * 
   * @param {DiscountData} discount_data 
   * @param {number} limit 
   */
  publish = async (discount_data, limit=10000) => {
    const coll_handle = `discount-${discount_data.code}`
    const dd = { 
      ...discount_data,
      _published: coll_handle
    }
    if(dd.info.details.meta.type==='order')
      throw 'Exporting a discount collection is only available for \
              Product discounts (you chose Order discount)'

    // save current document, allow to fail              
    await this.set(
      dd.code, dd
    )
    // await this.update(dd.code, { _published: coll_handle })

    
    // first, remove all previous collection tag from previous products              
    try {
      const products_to_remove = 
            await this.context.products.list([`col:${coll_handle}`], 10000)
      // console.log('products_to_remove ', products_to_remove);
      const batch_remove = writeBatch(this.context.firebase.db)
      products_to_remove.forEach(it => {
        const ref = doc(this.context.firebase.db, 'products', it[0])
        batch_remove.update(ref, { 
          search : arrayRemove(`col:${coll_handle}`),
          collections : arrayRemove(coll_handle),
          [`discounts.${dd.code}`]: deleteField()
        })
      })
      await batch_remove.commit()

    } catch (e) {
      console.log('Remove old: ' + String(e))
      console.log(e)
    }

    try {
      // filter in product filters
      var product_filters = dd.info.filters.filter(f => f.meta.type==='product')

      // then, make a server search that will filter out as much as possible
      /**@type {Filter} */
      var first_guided_filter = undefined
      /**@type {string[]} */
      var first_guided_search_terms = undefined

      if(first_guided_filter = product_filters.find(f => f.meta.op==='p-in-handles')) {
        first_guided_search_terms = first_guided_filter.value
      }
      else if(first_guided_filter = product_filters.find(f => f.meta.op==='p-in-tags')) {
        first_guided_search_terms = first_guided_filter.value.map(t => `tag:${t}`)
      }
      else if(first_guided_filter = product_filters.find(f => f.meta.op==='p-in-collections')) {
        first_guided_search_terms = first_guided_filter.value.map(c => `col:${c}`)
      }
    } catch (e) {
      throw 'Filter preparing error: ' + String(e)
    }

    try {
      // then, global filtering, this helps to reduce legal products for filtering
      var products = await 
              this.context.products.list(first_guided_search_terms, limit)

      // now local filtering (due to firebase limitations with filtering)
      var filtered_products = 
              this.filterProductsWithFilters(products, product_filters)
      
      // products = products.slice(0, 400)
    } catch (e) {
      throw 'Filtering error: ' + String(e)
    }

    try {
      // add collection tag to each product with batch write
      const batch = writeBatch(this.context.firebase.db)
      filtered_products.forEach(it => {
        const p = it[1]
        const isActive = p?.active==true || (p.active===undefined)
        if(!isActive)
          return;

        const ref = doc(this.context.firebase.db, 'products', it[0])
        const dd_mod = {...dd}
        delete dd_mod.search
        delete dd_mod.order
        batch.update(ref, { 
          collections : arrayUnion(coll_handle),
          search : arrayUnion(`col:${coll_handle}`),
          [`discounts.${dd_mod.code}`]: dd_mod
        })
      })
      await batch.commit()
    } catch (e) {
      throw 'Products update failed: ' + String(e)
    }

    try {
      // now, create a new collection
      /**@type {import('./js-docs-types').CollectionData} */
      const col_discount = {
        desc : dd.desc,
        handle : coll_handle,
        title : dd.title,
        media : dd.media,
        tags : dd.tags,
        attributes: dd.attributes,
        createdAt: Date.now()
      }

      await this.context.collections.set(
        col_discount.handle, col_discount
      )
      // await this.update(discount_data.code, { _published: coll_handle })
    } catch (e) {
      throw 'Collection creation failed: ' + String(e)
    }
    
  }

}