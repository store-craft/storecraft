import { StorecraftAdminSDK } from '.'
import { assert, delete_keys, text2tokens, 
         to_handle } from './common/utils/functional'
import { DiscountApplicationEnum, Handle, StorefrontData } from './js-docs-types'

/**
 * @param {StorefrontData} data
 * @returns {string[]}
 */
const create_search_index = (data) => {
  const tag_all = data.tags ?? []
  const tag_all_prefixed = tag_all.map(t => `tag:${t}`)
  const tag_vs = tag_all.map(it => it.split('_').pop())

  const terms = [
    data.handle,
    ...tag_all, ...tag_all_prefixed,
    ...tag_vs,
    ...text2tokens(data.title.toLowerCase())
  ]
  
  return terms
}

/**
 * 
 * @param {StorefrontData} d 
 * @returns 
 */
const validate = async d => {
  const errors = []
  /** @type {string[]} */
  const warnings = []

  if(!d.title)
    errors.push('Please set a Title')

  if(!d.handle)
    errors.push('Please set a handle')

  return {
    warnings, errors,
    hasWarnings : warnings.length>0,
    hasErrors : errors.length>0,
  }
}

const NAME = 'storefronts'

export default class StoreFronts  {

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
   * @returns {Promise<[boolean, string, StorefrontData]>}
   */
  get = (id, try_cache=true) => this.db.doc(NAME, id).get(try_cache)

  /**
   * @param {string} id 
   * @param {StorefrontData} data 
   * @returns id
   */
  update = (id, data) => {
    data.updatedAt = Date.now()
    return this.db.doc(NAME, id).update(data)
  }

  /**
   * @param {string} id 
   * @param {StorefrontData} data
   * @returns {Promise<[id: string, data: StorefrontData]>}
   */
  set = async (id, data) => {
    assert(
      id===data.handle,
      'Handle cannot be changed :('
    )

    try {
      const report = await validate(data)
      // console.log('report ', report);
      if(report.hasErrors)
        throw [...report.errors, ...report.warnings]

      data = { 
        ...data, 
        search: create_search_index(data), 
        updatedAt: Date.now() 
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
   * @returns {Promise<[id: string, data: StorefrontData]>}
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
  delete = (id) => this.db.col(NAME).remove(id)

  /**
   * 
   * @param {string[]} searchTokens 
   * @param {number} limit 
   * @param {boolean} from_cache 
   * @param {boolean} iterator true will give you a next iterator function for pagination 
   * @returns {Promise<[string, StorefrontData][]> | ()=>Promise<[string, StorefrontData][]>} 
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
   * @returns {Promise<[string, StorefrontData][]> | ()=>Promise<[string, StorefrontData][]>} a one promise or next handler iterator
   */
  listWithQuery = async (q, from_cache=false, iterator=false) => {
    const next = await this.db.col(NAME).paginate2(q, from_cache)
    return iterator ? next : 
                      next()
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