import { StorecraftAdminSDK } from '.'
import { TagData } from './js-docs-types'
import { assert } from './common/utils/functional'

/**
 * @param {TagData} d
 */
const validate = async (d) => {
  const errors = []
  const warnings = []

  return {
    warnings, errors,
    hasWarnings : warnings.length>0,
    hasErrors : errors.length>0,
  }
}

const NAME = 'tags'

export default class Tags {

  /**
   * 
   * @param {StorecraftAdminSDK} context 
   */
  constructor(context) {
    this.context = context
    this.db = context.db
  }

  /**
   * @param {string} id 
   * @param {boolean} try_cache 
   * @returns {Promise<[boolean, string, TagData]>}
   */
  get = (id, try_cache=true) => this.db.doc(NAME, id).get(try_cache)

  /**
   * @param {string} id 
   * @param {TagData} data 
   * @returns {string} id
   */
  update = (id, data) => {
    data = { ...data, updatedAt: Date.now() }
    id = data.name
    if (id !== data.name)
      throw 'Tag name cannot be changed !'
    return this.db.doc(NAME, id).update(data)
  }

  /**
   * @param {string} id 
   * @param {TagData} data
   * @returns {Promise<[id: string, data: TagData]>}
   */
  set = async (id, data) => {
    assert(
      id===data.name,
      'Tag name cannot be changed !'
    )

    try {
      const report = await validate(data)
      // console.log('report ', report);
      if(report.hasErrors)
        throw [...report.errors, ...report.warnings]

      data = {
        ...data,
        search: [data.name, ...(data.values ?? [])],
        updatedAt: Date.now()
      }  

      // test for inconsistency
      // document may have changed during this time
      const [prev_exists, __, prev_data] = await this.get(id, false)
      if(prev_exists && prev_data) {
        if(prev_data.updatedAt && prev_data.updatedAt > data.updatedAt)
          throw 'This document was updated elsewhere, please hit the reload button'
      }

    } catch (e) {
      throw Array.isArray(e) ? e : [e]
    }

    await this.db.doc(NAME, id).set(data)
    return [id, data]
  }

  /**
   * @param {TagData} data 
   * @returns {Promise<[id: string, data: TagData]>}
   */
  create = async (data) => {
    data = {
      ...data, 
      createdAt: Date.now()
    }

    const has_underscore_or_spaces = Boolean(data?.name?.match(/[_\s]/g))
    const is_empty = !Boolean(data?.name?.length)

    assert(
      !has_underscore_or_spaces && !is_empty,
      'Tag name cannot be empty or contain spaces, underscores'
    )

    const [exists, _, __] = await this.get(data.name)

    assert(
      !exists,
      `Tag name ${data.name} already exists !!`
    )
 
    return this.set(data.name, data)
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
   * @returns {Promise<[string, TagData][]> | ()=>Promise<[string, TagData][]>} a one promise or next handler iterator
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
   * @returns {Promise<[string, TagData][]> | ()=>Promise<[string, TagData][]>} a one promise or next handler iterator
   */
  listWithQuery = async (q, from_cache=false, iterator=false) => {
    const next = await this.db.col(NAME).paginate2(q, from_cache)
    return iterator ? next : 
                      next()
  }

  test = () => {
    // let q = { orderBy: [['updatedAt', 'asc']], limit }
    const q = {}
    q.where = [ ['name', 'in', ['console']] ]

    return this.db.col(NAME).list_with_filters(false, q.where)
  }

}