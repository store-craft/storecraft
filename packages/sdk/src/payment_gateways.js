import { StorecraftSDK } from '../index.js'
import { assert, text2tokens, 
         to_handle } from './utils.functional.js'
// import { OrderData, PaymentGatewayData } from './js-docs-types'
    
/**
 * 
 * @param {PaymentGatewayData} d 
 * @returns {{warnings: string[], errors: string[], 
 *            hasErrors: boolean, hasWarnings: boolean}}
 */
const validate = async d => {
  const errors = []
  const warnings = []

  if(!d.id) errors.push('An ID is missing')
  if(!d.title) errors.push('Missing Title')
  
  return {
    warnings, errors,
    hasWarnings : warnings.length>0,
    hasErrors : errors.length>0,
  }
}

 
/**
 * @param {PaymentGatewayData} data - data
 * @returns {string[]}
 */
const create_search_index = (data) => {
  return [
    data.id, 
    data.id.split('-')[0], 
    // data.gateway_id,
    ...text2tokens(data.title.toLowerCase()),
  ]
}

const NAME = 'payment_gateways'
import { jwtVerify, SignJWT } from 'jose'
export default class PaymentGateways {

  /**
   * @param {StorecraftSDK} context 
   */
  constructor(context) {
    this.context = context
    this.db = context.db
  }

  withBackend = async (s) => {
    const settings_main = await this.context.settings.get('main')
    let url = settings_main[2]?.backend?.url
    url = url.endsWith('/') ? url.slice(0, -1) : url
    const apiKey = settings_main[2]?.backend?.apiKey ?? ''
    const secret = settings_main[2]?.backend?.secret?.trim() ?? ''
    const headers = {}

    if(secret) {
      const alg = 'HS256'
      const secret_encoded = new TextEncoder().encode(secret)
      const jwt = await new SignJWT({ })
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setIssuer('shelf-cms')
        .setAudience('shelf-backend')
        .setExpirationTime('5minutes')
        .sign(secret_encoded);
      headers.Authorization = `BEARER ${jwt}`
    }
    
    // return `${this.context.config.backend}/app/payments-gateways/${s}`
    return {
      url: `${url}/payments-gateways/${s}?apiKey=${apiKey}`,
      headers
    }
  }

  /**
   * get the status of payment of order
   * @param {string} gateway_id the id of the gateway
   * @param {string} order_id the ID of the order
   */
  status = async (gateway_id, order_id) => {
    const {
      url, headers 
    } = await this.withBackend(`${gateway_id}/status/${order_id}`)
    const responese = await fetch(
      url,
      {
        method: 'get',
        headers
      }
    )
    
    const result = await responese.json()
    if(responese.ok)
      return result
    throw new Error('Problem fetching status')
  }

  /**
   * get the status of payment of order
   * @param {string} gateway_id the id of the gateway
   * @param {string} order_id the ID of the order
   */
  capture = async (gateway_id, order_id) => {
    const {
      url, headers 
    } = await this.withBackend(`${gateway_id}/capture/${order_id}`)
    const responese = await fetch(
      url,
      {
        method: 'post',
        headers
      }
    )
    
    const result = await responese.json()
    if(responese.ok)
      return result
    throw new Error('Problem fetching status')
  }

  /**
   * get the status of payment of order
   * @param {string} gateway_id the id of the gateway
   * @param {string} order_id the ID of the order
   */
  void = async (gateway_id, order_id) => {
    const {
      url, headers 
    } = await this.withBackend(`${gateway_id}/void/${order_id}`)
    const responese = await fetch(
      url,
      {
        method: 'post',
        headers
      }
    )
    
    const result = await responese.json()
    if(responese.ok)
      return result
    throw new Error('Problem fetching status')
  }  

    /**
   * get the status of payment of order
   * @param {string} gateway_id the id of the gateway
   * @param {string} order_id the ID of the order
   */
  refund = async (gateway_id, order_id) => {
    const {
      url, headers 
    } = await this.withBackend(`${gateway_id}/refund/${order_id}`)
    const responese = await fetch(
      url,
      {
        method: 'post',
        headers
      }
    )
    
    const result = await responese.json()
    if(responese.ok)
      return result
    throw new Error('Problem fetching status')
  }  

  list = async (from_cache=false) => {
    fetch(
      `${this.context.config.backend}/app/payments-gateways/list`,
      {
        method: 'get', 
      }
    )

  }

  /**
   * @param {string} id 
   * @param {boolean} try_cache 
   * @returns {Promise<[boolean, string, PaymentGatewayData]>}
   */
  get = (id, try_cache=true) => this.db.doc(NAME, id).get(try_cache)

  /**
   * @param {string} id 
   * @param {PaymentGatewayData} data 
   * @returns {string} id
   */
  update = (id, data) => {
    data = { ...data, updatedAt: Date.now() }
    assert(
      id === data.id,
      'ID cannot be changed !'
    )
    return this.db.doc(NAME, id).update(data)
  }

  /**
   * @param {string} id 
   * @param {PaymentGatewayData} data
   * @returns {Promise<[id:string, data: PaymentGatewayData]>}
   */
  set = async (id, data) => {
    assert(
      id === data.id,
      'ID cannot be changed !'
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

    } catch (e) {
      throw Array.isArray(e) ? e : [e]
    }
    
    await this.db.doc(NAME, id).set(data)
    return [id, data]
  }

  /**
   * @param {PaymentGatewayData} data 
   * @returns {Promise<[id:string, data: PaymentGatewayData]>}
   */
  create = async (data) => { 
    data = { 
      ...data, 
      createdAt: Date.now(),
      id: data.id
    }

    assert(
      data.id,
      `Missing Gateway ID`
    )

    const [exists, _, __] = await this.get(data.id)

    assert(
      !exists,
      `ID ${data.id} already exists !!`
    )
 
    return this.set(data.id, data)
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
   * @returns {Promise<[string, PaymentGatewayData][]>>} a one promise or next handler iterator
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
   * @returns {Promise<[string, PaymentGatewayData][]> | ()=>Promise<[string, PaymentGatewayData][]>} a one promise or next handler iterator
   */
  listWithQuery = async (q, from_cache=false, iterator=false) => {
    const next = await this.db.col(NAME).paginate2(q, from_cache)
    return iterator ? next : 
                      next()
  }
}