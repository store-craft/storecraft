import { StorecraftAdminSDK } from '.'
import { 
  assert,
  filter_fields, 
  filter_unused, 
  text2tokens, to_handle } from './common/utils/functional'
import { CollectionData, ProductData } from './js-docs-types'
// import { arrayRemove, arrayUnion, doc, writeBatch } from 'firebase/firestore'

/**
 * @param {CollectionData} data 
 * @returns {string[]}
 */
const create_search_index = (data) => {
  const tag_all = data.tags ?? []
  const tag_all_prefixed = tag_all.map(t => `tag:${t}`)
  const tag_vs = tag_all.map(it => it.split('_').pop())

  return [
    data.handle,
    `col:${data.handle}`,
    data.title.toLowerCase(), 
    ...text2tokens(data.title.toLowerCase()),
    ...tag_all, ...tag_all_prefixed,
    ...tag_vs
  ]
}

/**
 * @param {CollectionData} d 
 */
const validate = async d => {
  const errors = []
  const warnings = []

  if(!d.title)
    errors.push('Collection Name is mandatory')

  return {
    warnings, errors,
    hasWarnings : warnings.length>0,
    hasErrors : errors.length>0,
  }
}

const NAME = 'collections'

export default class {
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
   * @returns {Promise<[boolean, string, CollectionData]>}
   */
  get = (id, try_cache=true) => this.db.doc(NAME, id).get(try_cache)
  
  /**
   * @param {string} id 
   * @param {CollectionData} data 
   * @returns id
   */
  update = (id, data) => {
    return this.db.doc(NAME, id).update({...data, updatedAt: Date.now()})
  }

  /**
   * @param {string} id 
   * @param {CollectionData} data
   * @returns {Promise<[id: string, data: CollectionData]>}
   */
  set = async (id, data) => {
    assert(
      id===data.handle,
      'Handle cannot change !'
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
   * @param {StorefrontData} data 
   * @returns {Promise<[id: string, data: CollectionData]>}
   */
  create = async (data) => {

    data = {
      ...data,
      createdAt: Date.now(),
      handle: to_handle(data.handle) ?? to_handle(data.title)
    }

    assert(
      data.handle,
      'Handle could not be computed'
    )

    const [exists, _, __] = await this.get(data.handle)

    assert(
      !exists,
      `handle ${data.handle} already exists !!`
    )

    return this.set(data.handle, data)
  }

  /**
   * @param {string} id 
   * @returns nada
   */
  delete = (id) => {
    // side effects: 
    // 1. TODO:: delete auth user as well with cloud functions
    //    https://stackoverflow.com/questions/38800414/delete-a-specific-user-from-firebase
    return this.db.col(NAME).remove(id)
  }

  /**
   * 
   * @param {string} collection_handle 
   * @param {number} limit 
   */
  publish = async (collection_handle, limit=1000) => {
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

  /**
   * Add tags in bulk to products in collection
   * @param {string} colId 
   * @param {string[]} tags 
   * @param {boolean} add true for add false for remove 
   */
  bulkAddRemoveTags = async (colId, tags, add=true) => {

    // first get all products in collection
    const tag_all = tags ?? []
    const tag_all_prefixed = tag_all.map(t => `tag:${t}`)
    const tag_vs = tag_all.map(it => it.split('_').pop())

    var products = await this.context.products.list([`col:${colId}`], 10000)
    // console.log('products ', products)
    // console.log('colId ', colId)
    const batch = writeBatch(this.context.firebase.db)
    products.forEach(it => {
      const ref = doc(this.context.firebase.db, 'products', it[0])
      batch.update(ref, { 
        tags : add ? arrayUnion(...tags) : arrayRemove(...tags),
        search : add ? arrayUnion(...tag_all, ...tag_all_prefixed, ...tag_vs) : 
                       arrayRemove(...tag_all, ...tag_all_prefixed, ...tag_vs),
        updatedAt : Date.now()
      })
    })
    await batch.commit()

  }

  /**
   * 
   * @param {string[]} searchTokens 
   * @param {number} limit 
   * @param {boolean} from_cache 
   * @param {boolean} iterator true will give you a next iterator function for pagination 
   * @returns {Promise<[string, CollectionData][]> | ()=>Promise<[string, CollectionData][]>} 
   * a one promise or next handler iterator
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
   * @returns {Promise<[string, CollectionData][]> | ()=>Promise<[string, CollectionData][]>} 
   * a one promise or next handler iterator
   */
  listWithQuery = async (q, from_cache=false, iterator=false) => {
    const next = await this.db.col(NAME).paginate2(q, from_cache)
    return iterator ? next : 
                      next()
  }
}