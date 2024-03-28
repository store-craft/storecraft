// import { QueryConstraint, doc, runTransaction } from 'firebase/firestore'
import { StorecraftAdminSDK } from '.'
import { text2tokens, 
         to_handle } from './common/utils/functional'
import { NotificationData, PostData } from './js-docs-types'
import { MINUTE } from '../admin/utils/time'


/**
 * @typedef {NotificationData} Data
 */

/**
 * @typedef {object} BotMetaData
 * @property {number} updatedAt
 * 
 */

const NAME = 'bots'

export default class Bots {

  /**
   * @param {StorecraftAdminSDK} context 
   */
  constructor(context) {
    this.context = context
    this.db = context.db
  }

  init = async () => {
    // this.activitySpy()
    this.activityBot()
    setInterval(
      this.activityBot,
      MINUTE*10
    )
  }

  activityBot = async () => {
    // console.trace()
    try {
      const db = this.db.firebaseDB
      const result = await runTransaction(
        this.db.firebaseDB,
        async t => {
          const now = Date.now()
          const ref = doc(db, NAME, 'shelf-activity-bot')
          const m = await t.get(ref)
          const updatedAt = m.data()?.updatedAt ?? 0
  
          const q = {
            where: [
              ['updatedAt', '>', updatedAt]
            ]
          }
  
          const cols = ['collections', 'products', 'users', 'tags', 'discounts']
          const results = cols.map(
            async c => [c, await this.db.col(c).count(q)]
          )
          
          t.set(
            m.ref,
            {
              updatedAt: now
            }
          )
  
          return await Promise.all(results)
    
        }, 
        {
          maxAttempts: 1
        }
      )

      let filtered = result.filter(
        it => it[1]
      )

      if(filtered.length==0)
        return

      const search = filtered.map(it => it[0])
      const messages = filtered.map(
        it => {
          const [c, count] = it
          return `\n* 🚀 **${count}** \`${c}\` were updated`
        }
      );

      const message = ["**Latest Activity updates**", ...messages].join(' ')
      /**@type {NotificationData} */
      const noti = {
        message,
        search,
        author: 'shelf-activity-bot 🤖',
        updatedAt: Date.now()
      }

      // console.log(messages)
      // console.log(message)

      await this.context.notifications.add(
        noti
      )

    } catch (e) {
      // failed because another the document updated from another client
      // this is ok
      console.log(e)
    }
    


  }

  /**
   * @param {string} id 
   * @param {boolean} try_cache 
   * @returns {Promise<[exists: boolean, id: string, data: BotMetaData]>}
   */
  getNo = (try_cache=false) => this.db.doc(NAME, 'activity_spy').get(try_cache)

  /**
   * @param {string} id 
   * @param {boolean} try_cache 
   * @returns {Promise<[exists: boolean, id: string, data: BotMetaData]>}
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
    if (id !== data.handle)
      throw 'Post handle cannot be changed !'
    return this.db.doc(NAME, id).update(data)
  }

  /**
   * @param {string} id 
   * @param {Data} data
   * @returns 
   */
  set = async (id, data) => {
    // side effects:
    // 1. update search index
    // 1. update timestamps
    if (id !== data.handle)
      throw 'Post id cannot be changed !'
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
    return data
  }

  /**
   * @param {Data} data 
   * @returns {Promise<[string, Data]>}
   */
  create = async (data) => { 
    data = { 
      ...data, 
      createdAt: Date.now(),
      handle: to_handle(data.title) 
    }
    
    if(!data.handle)
      throw 'Please choose a valid Title'

    const [exists, _, __] = await this.get(data.handle)

    if(exists)
      throw `handle ${data.handle} already exists !!`
 
    return [ data.handle, 
             await this.set(data.handle, data)]
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