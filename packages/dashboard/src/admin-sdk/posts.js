import { StorecraftAdminSDK } from "."
import { assert, text2tokens, 
         to_handle } from "./common/utils/functional"
import { PostData } from './js-docs-types'

/**
 * 
 * @param {PostData} d 
 * @returns {{warnings: string[], errors: string[], 
 *            hasErrors: boolean, hasWarnings: boolean}}
 */
const validate = async d => {
  const errors = []
  const warnings = []

  if(!d.title)
    errors.push('A Title is missing')
  if(!d.text)
    errors.push('A post text is missing')
  
  return {
    warnings, errors,
    hasWarnings : warnings.length>0,
    hasErrors : errors.length>0,
  }
}

 
/**
 * @param {PostData} data - data
 * @returns {string[]}
 */
const create_search_index = (data) => {
  const tag_all = data.tags ?? []
  const tag_vs = tag_all.map(it => it.split('_').pop())
  const tag_all_prefixed = tag_all.map(t => `tag:${t}`)
  return [data.handle, 
          ...text2tokens(data.title.toLowerCase()),
          ...tag_vs, ...tag_all, ...tag_all_prefixed, 
          ]
}

const NAME = 'posts'

export default class Posts {

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
   * @returns {Promise<[boolean, string, PostData]>}
   */
  get = (id, try_cache=true) => this.db.doc(NAME, id).get(try_cache)

  /**
   * @param {string} id 
   * @param {PostData} data 
   * @returns id
   */
  update = (id, data) => {
    data = { ...data, updatedAt: Date.now() }
    if (id !== data.handle)
      throw 'Post handle cannot be changed !'
    return this.db.doc(NAME, id).update(data)
  }

  /**
   * @param {string} id 
   * @param {PostData} data
   * @returns {Promise<[id: string, data: PostData]>}
   */
  set = async (id, data) => {
    // side effects:
    // 1. update search index
    // 1. update timestamps
    assert(
      id===data.handle,
      'Post id cannot be changed !'
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
   * @param {DiscountData} data 
   * @returns {Promise<[id: string, data: PostData]>}
   */
  create = async (data) => { 
    data = { 
      ...data, 
      createdAt: Date.now(),
      handle: to_handle(data.title) 
    }
    
    assert(
      data.handle,
      'Please choose a valid Title'
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
   * @returns {Promise<[string, PostData][]>>} a one promise or next handler iterator
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
   * @returns {Promise<[string, PostData][]> | ()=>Promise<[string, PostData][]>} a one promise or next handler iterator
   */
  listWithQuery = async (q, from_cache=false, iterator=false) => {
    const next = await this.db.col(NAME).paginate2(q, from_cache)
    return iterator ? next : 
                      next()
  }
}