import { StorecraftAdminSDK } from '.';
import { assert, text2tokens } from './common/utils/functional';
import { isEmailValid } from './common/utils/validation'
import { UserData } from './js-docs-types'

/**
 * 
 * @param {UserData} data 
 * @returns 
 */
const create_user_search_index = (data) => {
  const email = data?.email
  const firstname = text2tokens(data.firstname.toLowerCase());
  const lastname = text2tokens(data.lastname.toLowerCase());
  const tag_all = data.tags ?? []
  const tag_all_prefixed = tag_all.map(t => `tag:${t}`)
  const tag_vs = tag_all.map(it => it.split('_').pop())

  const terms = [
    firstname[0], 
    lastname[0], 
    email.split('@')[0], 
    email, 
    ...(data.uid ? [data.uid] : []),
    ...tag_all, 
    ...tag_all_prefixed,
    ...tag_vs
  ]

  return terms
}

/**
 * 
 * @param {UserData} d 
 * @returns 
 */
const validate = async d => {
  const errors = []
  const warnings = []

  if(!d.firstname)
    errors.push('First Name is mandatory')
  if(!d.lastname)
    errors.push('Last Name is mandatory')

  if(!d.uid)
    errors.push('UID is mandatory')

  if(!isEmailValid(d.email))
    errors.push('Email is not valid format')

  return {
    warnings, errors,
    hasWarnings : warnings.length>0,
    hasErrors : errors.length>0,
  }
}

const NAME = 'users'

export default class Users {

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
   * @returns {Promise<[boolean, string, UserData]>}
   */
  get = (id, try_cache=true) => this.db.doc(NAME, id).get(try_cache)

  /**
   * 
   * @param {string} id 
   * @param {UserData} data 
   * @returns 
   */
  update = (id, data) => {
    return Promise.reject('Update is not supported !! ')
  }

  /**
   * 
   * @param {string} id 
   * @param {UserData} data 
   * @returns {Promise<id: string, data: UserData>}
   */
  set = async (id, data) => {
  
    assert(
      id===data.uid,
      'UID cannot change !! '
    )

    try {
      const report = await validate(data)
      if(report.hasErrors)
        throw [...report.errors, ...report.warnings]

      data = {
        ...data, 
        updatedAt: Date.now(),
        search: create_user_search_index(data) 
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
   * 
   * @param {UserData} data 
   * @returns {Promise<id: string, data: UserData>}
   */
  create = async data => {
    data = {
      ...data,
      createdAt: Date.now()
    }

    assert(
      data.uid,
      'User ID (UID) is missing'
    )

    const [exists, _, __] = await this.get(data.uid)

    assert(
      !exists,
      `handle ${data.uid} already exists !!`
    )

    return this.set(data.uid, data)
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
   * @returns {Promise<[string, UserData][]> | ()=>Promise<[string, UserData][]>} a one promise or next handler iterator
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
   * @returns {Promise<[string, UserData][]> | ()=>Promise<[string, UserData][]>} a one promise or next handler iterator
   */
  listWithQuery = async (q, from_cache=false, iterator=false) => {
    const next = await this.db.col(NAME).paginate2(q, from_cache)
    return iterator ? next : 
                      next()
  }
}