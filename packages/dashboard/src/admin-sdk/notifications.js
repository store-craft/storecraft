import { StorecraftAdminSDK } from '.'
import { assert, text2tokens, 
         to_handle } from './common/utils/functional'
import { NotificationData, PostData } from './js-docs-types'


/**
 * @typedef {NotificationData} Data
 */

const NAME = 'notifications'

export default class Notifications {

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
   * @returns {Promise<[boolean, string, Data]>}
   */
  get = (id, try_cache=true) => this.db.doc(NAME, id).get(try_cache)


  /**
   * add notification
   * @param {Data} data 
   */
  add = (data) => {
    data = {
      ...data,
      updatedAt: Date.now()
    }
    return this.db.col(NAME).add(data)
  }

  /**
   * add notification
   * @param {Data[]} data 
   */
  addBulk = (data) => {
    return this.db.col(NAME).addBulk(data)
  }

  meta = () => {
    return this.get('_meta')
  }

  /**
   * @param {string} id 
   * @param {Data} data 
   * @returns id
   */
  update = (id, data) => {
    data = { ...data, updatedAt: Date.now() }
    assert(
      id===data.handle,
      'id cannot be changed !'
    )

    return this.db.doc(NAME, id).update(data)
  }

  /**
   * @param {string} id 
   * @param {NotificationData} data
   * @returns {Promise<[id: string, data: NotificationData]>}
   */
  set = async (id, data) => {
    assert(
      id===data.handle,
      'id cannot be changed !'
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
   * @param {Data} data 
   * @returns {Promise<[id: string, data: NotificationData]>}
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
   * Test if backend moght have new data economically
   * @returns {Promise<boolean>}
   */
  hasChanged = async () => {
    try {
      // try cache
      const cached = await this.list([], 50, true, false)
      if (cached.length==0)
        return true

      // compute how many latest updates with max timestamp in cache  
      const max_updated = cached.reduce(
        (p, c) => {
          const updatedAt = c[1]?.updatedAt

          if(updatedAt==p.timestamp)
            p.count+=1
          else if(updatedAt>p.timestamp)
            p.count=1

          p.timestamp = Math.max(updatedAt ?? -1, p.timestamp)
          return p
        },
        {
          timestamp: 0,
          count: 0
        }
      )

      // now, use a light count query to the database
      const count = await this.context.db.col(NAME).count(
        {
          where: [
            ['updatedAt', '>=', max_updated.timestamp]
          ]
        }
      )

      // console.log(cached)
      // console.log('count ', count)
      // console.log('max_updated ', max_updated)

      if(count > max_updated.count)
        return true
      
      return false
      
    } catch (e) {
      // error
      console.error(e)
      return true
    }
    
  }

  /**
   * 
   * @param {string[]} searchTokens 
   * @param {number} limit 
   * @param {boolean} from_cache 
   * @param {boolean} iterator true will give you a next iterator function for pagination 
   * @returns {Promise<[string, Data][]>>} a one promise or next handler iterator
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
   * @returns {Promise<[string, Data][]> | ()=>Promise<[string, Data][]>} a one promise or next handler iterator
   */
  listWithQuery = async (q, from_cache=false, iterator=false) => {
    const next = await this.db.col(NAME).paginate2(q, from_cache)
    return iterator ? next : 
                      next()
  }
}