import { StorecraftAdminSDK } from '.'
import { ShippingData } from  './js-docs-types'
import { assert, text2tokens } from './common/utils/functional'

const NAME = 'shipping_methods'

/**
 * 
 * @param {ShippingData} d 
 */
const create_search_index = (d) => {

  return [
    d.id,
    d.id.split('-')[0],
    ...text2tokens(d.name),
    d.name,
    String(d.price),
    ...(d.tags ?? []),
    ...(d.tags?.map(t => t?.split('_')?.pop()) ?? []),
  ]
}

export default class ShippingMethods  {

  /**
   * 
   * @param {StorecraftAdminSDK} context 
   */
  constructor(context) {
    this.context = context
    this.db = context.db
  }

  /**
   * 
   * @param {string} id 
   * @param {boolean} try_cache 
   * @returns {Promise<[boolean, string, ShippingData]>}
   */
  get = (id, try_cache=true) => this.db.doc(NAME, id).get(try_cache)

  /**
   * 
   * @param {string} id 
   * @param {ShippingData} data 
   * @returns 
   */
  update = (id, data) => {
    assert(
      id===data.id,
      'ID mismatch'
    )

    return this.db.doc(NAME, id).update(
      {
        ...data, 
        updatedAt: Date.now()
      }
    )
  }

  /**
   * @param {string} id 
   * @param {ShippingData} data 
   * @returns {Promise<[id: string, data: ShippingData]>}
   */
  set = async (id, data) => {
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
    
    assert(
      id===data.id,
      'ID mismatch'
    )

    assert(
      data?.price,
      'Please set a price !'
    )

    assert(
      data?.name,
      'Please set a name !'
    )

    await this.db.doc(NAME, id).set(data)
    return [id, data]
  }

  /**
   * @param {ShippingData} data 
   * @returns {Promise<[id: string, data: ShippingData]>}
   */
  create = async (data) => {
    data = {
      ...data, 
      id: uuidv4(),
      createdAt: Date.now()
    }

    return this.set(data.id, data)
  }

  /**
   * 
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
   * @returns {Promise<[string, ShippingData][]> | ()=>Promise<[string, ShippingData][]>} a one promise or next handler iterator
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
   * @returns {Promise<[string, ShippingData][]> | ()=>Promise<[string, ShippingData][]>} a one promise or next handler iterator
   */
  listWithQuery = async (q, from_cache=false, iterator=false) => {
    const next = await this.db.col(NAME).paginate2(q, from_cache)
    return iterator ? next : 
                      next()
  }
}