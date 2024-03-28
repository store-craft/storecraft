import { isNumberValid } from './common/utils/validation'
// import { writeBatch, doc, arrayUnion, 
//          arrayRemove, deleteField } from 'firebase/firestore'
import { assert, text2tokens, 
         to_handle } from './common/utils/functional'
import { StorecraftAdminSDK } from '.'
import { 
  DiscountData, DiscountMetaEnum, 
  Filter, 
  FilterMetaEnum, ProductData } from './js-docs-types'

/**
 * @param {DiscountData} data 
 * @returns {string[]}
 */
const create_search_index = (data) => {

  const tag_all = data.tags ?? []
  const tag_vs = tag_all.map(it => it.split('_').pop())
  const tag_all_prefixed = tag_all.map(t => `tag:${t}`)
  const terms = [
    data.code, 

    ...text2tokens(data.title.toLowerCase()),

    data.application.name.toLowerCase(),
    `app:${data.application.name.toLowerCase()}`, 
    `app:${data.application.id}`, 

    data.info.details.meta.type.toLowerCase(),
    data.info.details.meta.id.toString(),

    `type:${data.info.details.meta.id}`, 
    `type:${data.info.details.meta.type.toLowerCase()}`, 
    
    `enabled:${data.enabled.toString()}`, 

    ...tag_all, ...tag_all_prefixed,
    ...tag_vs
  ]
  return terms
}

/**
 * @param {DiscountData} d 
 * @returns 
 */
const validate = async d => {
  const errors = []
  const warnings = []

  if(!isNumberValid(d.order))
    errors.push('Discount Ordering should be a non negative integer')

  if(!d.title)
    errors.push('Please set a Discount Title')

  if(!d.application)
    errors.push('Please set a Discount type (Automatic or Coupon)')

  if(!(d?.info?.filters?.length))
    errors.push('You should Specify at least 1 Filter')

  if(!(d?.info?.details))
    errors.push('You have to choose a Discount')

  if(!(d?.info?.details?.extra))
    errors.push('Your Discount is not properly filled')

  return {
    warnings, errors,
    hasWarnings : warnings.length>0,
    hasErrors : errors.length>0,
  }
}

const NAME = 'discounts'

export default class Discounts  {

  /**
   * @param {StorecraftAdminSDK} context 
   */
  constructor(context) {
    this.context = context
    this.db = context.db
  }

  /**
   * @param {string} id 
   * @param {boolean} try_cache 
   * @returns {Promise<[boolean, string, DiscountData]>}
   */
  get = (id, try_cache=true) => this.db.doc(NAME, id).get(try_cache)

  /**
   * @param {string} id 
   * @param {DiscountData} data 
   * @returns id
   */
  update = async (id, data) => {
    return await this.db.doc(NAME, id).update({
      ...data, 
      updatedAt: Date.now()
    })
  }

  /**
   * @param {string} id 
   * @param {DiscountData} data
   * @returns {Promise<[id: string, data: DiscountData]>}
   */
  set = async (id, data) => {
    assert(
      id===data.code,
      'Discount Code cannot be changed :('
    )  

    try {
      const report = await validate(data)
      // console.log('report ', report);
      if(report.hasErrors)
        throw [...report.errors, ...report.warnings]
      
      data = {
        ...data,
        updatedAt: Date.now(),
        search: create_search_index(data)   
      }
      
      // test for inconsistency
      // document may have changed during this time
      const [prev_exists, __, prev_data] = await this.get(id, false)
      if(prev_exists && prev_data) {
        if(prev_data.updatedAt && prev_data.updatedAt > data.updatedAt)
          throw 'This document was updated elsewhere, please hit the reload button'
      }
      
      // media usage report
      this.context.images
          .reportSearchAndUsageFromRegularDoc(NAME, id, data)
    } catch (e) {
      throw Array.isArray(e) ? e : [e]
    }
  
    await this.db.doc(NAME, id).set(data)
    return [id, data]
  }

  /**
   * @param {DiscountData} data 
   * @returns {Promise<[id: string, data: DiscountData]>}
   */
  create = async (data) => {
    data = {
      ...data,
      createdAt: Date.now(),
      code: to_handle(data.code)
    }

    assert(
      data.code,
      'Code could not be computed'
    )

    const [exists, _, __] = await this.get(data.code)

    assert(
      !exists,
      `code ${data.code} already exists !!`
    )

    return this.set(data.code, data)
  }

  /**
   * @param {string} id 
   * @returns nada
   */
  delete = async (id) => {
    try {
      const coll_handle = `discount-${id}`
      const products_to_remove = 
            await this.context.products.list([`col:${coll_handle}`], 10000)
      // console.log('products_to_remove ', products_to_remove);
      const batch_remove = writeBatch(this.context.firebase.db)
      products_to_remove.forEach(it => {
        const ref = doc(this.context.firebase.db, 'products', it[0])
        batch_remove.update(ref, { 
          search : arrayRemove(`col:${coll_handle}`),
          collections : arrayRemove(coll_handle),
          [`discounts.${id}`]: deleteField()
        })
      })
      await batch_remove.commit()

    } catch (e) {
      console.log('Remove old: ' + String(e))
      console.log(e)
    }

    return this.db.col(NAME).remove(id)
  }

  /**
   * | ()=>Promise<[string, DiscountData][]
   * @param {string[]} searchTokens 
   * @param {number} limit 
   * @param {boolean} from_cache 
   * @param {boolean} iterator true will give you a next iterator function for pagination 
   * @returns {Promise<[a:string, b:DiscountData][]> >} a one promise or next handler iterator
   */
  list = (searchTokens=[], limit=100, from_cache=false, iterator=false) => {
    let q = { orderBy: [['updatedAt', 'desc']], limit }
    if (Array.isArray(searchTokens) && searchTokens.length)
      q.where = [ ['search', 'array-contains-any', searchTokens] ]

    return this.listWithQuery(q, from_cache, iterator)
  }

  /**
   * List with query, make sure you have database indexed for the query
   * 
   * @param {object} q { orderBy: [['field1', 'asc']], where: [['name', '=', 'tomer'], limit: 10] } 
   * @param {boolean} from_cache force cache if available
   * @param {boolean} iterator true will give you a next iterator function for pagination 
   * @returns {Promise<[string, DiscountData][]> | ()=>Promise<[string, DiscountData][]>} a one promise or next handler iterator
   */
  listWithQuery = async (q, from_cache=false, iterator=false) => {
    const next = await this.db.col(NAME).paginate2(q, from_cache)
    return iterator ? next : 
                      next()
  }

  /**
   * 
   * @param {ProductData} product 
   * @param {Filter} filter 
   * @returns 
   */
  testProductWithFilter = (product, filter) => {
    switch (filter.meta.op) {
      case FilterMetaEnum.p_all.op:
        return true
      case FilterMetaEnum.p_in_collections.op:
        return filter.value.some(r => product.collections.includes(r))
      case FilterMetaEnum.p_not_in_collections.op:
        return filter.value.every(r => !product.collections.includes(r))
      case FilterMetaEnum.p_in_tags.op:
        return filter.value.some(r => product.tags.includes(r))
      case FilterMetaEnum.p_not_in_tags.op:
        return filter.value.every(r => !product.tags.includes(r))
      case FilterMetaEnum.p_in_handles.op:
        return filter.value.includes(product.handle)
      case FilterMetaEnum.p_not_in_handles.op:
        return !filter.value.includes(product.handle)
      case FilterMetaEnum.p_in_price_range.op:
        return (product.price >= (filter.value.from ?? 0)) &&
               (product.price <= (filter.value.to ?? Number.POSITIVE_INFINITY))

      default:
        return true
    }
  }

  /**
   * @param {ProductData} product 
   * @param {Filter[]} filters 
   * @returns 
   */
  testProductWithFilters = (product, filters) => {
    return filters.reduce(
      (p, c) => p && this.testProductWithFilter(product, c), 
      true
    )
  }  

  /**
   * @param {[string, ProductData][]} products [[id, product],..] tuples 
   * @param {Filter[]} filters 
   * @returns 
   */
  filterProductsWithFilters = (products, filters) => {
    return products.filter(
      p => this.testProductWithFilters(
          p[1], filters
        )
    )
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