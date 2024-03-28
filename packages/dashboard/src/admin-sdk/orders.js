import { StorecraftAdminSDK } from '.'
import { toUTCDateString } from './common/utils/time'
import { isEmailValid, isNumberValid } from './common/utils/validation'
import { DiscountData, LineItem, OrderData, ShippingData } from './js-docs-types'
import { calculate_pricing } from './common/calculate-pricing'
import { assert } from './common/utils/functional'

/**
 * @param {OrderData} data
 * @returns {string[]}
 */
const create_search_index = (data) => {

  const { firstname, lastname } = data.contact
  const { uid, email } = data.contact
  const contact_vs = []
  if(firstname) contact_vs.push(String(firstname).toLowerCase())
  if(lastname) contact_vs.push(String(lastname).toLowerCase())
  if(uid) {
    contact_vs.push(`uid:${uid}`)
    contact_vs.push(uid)
  }
  if(email) contact_vs.push(email)

  const readable_date = data?.updatedAt ? 
              [toUTCDateString(data.updatedAt)] : []
              
  const status_payment = data?.status?.payment?.name ? 
          [ 
            String(data.status.payment.name).toLowerCase(), 
            String(data.status.payment.name), 
            `payment:${String(data.status.payment.name).toLowerCase()}`,
            `payment:${String(data.status.payment.id)}`
          ] : []
  const status_fulfill = data?.status?.fulfillment?.name ? 
          [ 
            String(data.status.fulfillment.name).toLowerCase(), 
            String(data.status.fulfillment.name), 
            `fulfill:${String(data.status.fulfillment.name).toLowerCase()}`,
            `fulfill:${String(data.status.fulfillment.id)}`,
          ] : []
  
  const discounts = data?.pricing?.evo?.slice(1)?.map(
    e => `discount:${e.discount_code}`
  ) ?? [];

  const line_items = data?.line_items?.map(
    li => `li:${li.id ?? li?.data?.handle}`
  ) ?? [];

  const price = data.pricing?.total ? [ String(data.pricing?.total) ] : []

  const terms = [
    data.id, 
    data.id.split('-')[0],
    ...contact_vs, 
    ...readable_date, 
    ...status_payment, 
    ...status_fulfill,
    ...price,
    ...discounts,
    ...line_items
  ]

  return terms
}

/**
 * 
 * @param {OrderData} d 
 * @returns {string[]}
 */
const validate = async d => {
  const errors = []
  const warnings = []

  if(!isEmailValid(d.contact.email))
    errors.push('You should write a valid Email Address')

  if(!isNumberValid(d?.pricing?.total))
    errors.push('Total Price should be a non-negative number')

  return {
    warnings, errors,
    hasWarnings : warnings.length>0,
    hasErrors : errors.length>0,
  }
}

const NAME = 'orders'

export default class Orders  {
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
   * @returns {Promise<[boolean, string, OrderData]>}
   */
  get = (id, try_cache=true) => this.db.doc(NAME, id).get(try_cache)

  /**
   * @param {string} id 
   * @param {OrderData} data 
   * @returns id
   */
  update = (id, data) => {
    data = { ...data, updatedAt: Date.now() }
    id = data.name
    assert(
      id===data.id,
      'Order ID cannot be changed !'
    )
    return this.db.doc(NAME, id).update(data)
  }

  /**
   * @param {string} id 
   * @param {OrderData} data
   * @returns {Promise<[id: string, data: OrderData]>}
   */
  set = async (id, data) => {
    assert(
      id===data.id,
      'Order ID cannot be changed !'
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
   * @param {OrderData} data 
   * @returns {Promise<[id: string, data: OrderData]>}
   */
  create = async (data) => {
    data = {
      ...data,
      createdAt: Date.now(),
      id: uuidv4()
    }

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
   * @returns {Promise<[string, OrderData][]> | ()=>Promise<[string, OrderData][]>} a one promise or next handler iterator
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
   * @returns {Promise<[string, OrderData][]>>} a one promise or next handler iterator
   */
  listWithQuery = async (q, from_cache=false, iterator=false) => {
    const next = await this.db.col(NAME).paginate2(q, from_cache)
    return iterator ? next : 
                      next()
  }

  /**
   * calculate pricing of line items
   * 
   * @param {LineItem[]} line_items 
   * @param {DiscountData[]} auto_discounts 
   * @param {DiscountData[]} coupons 
   * @param {ShippingData} shipping_method 
   * @param {string} [uid] 
   */
  calculatePricing = 
  async (line_items, coupons=[], shipping_method, uid) => {
    // fetch auto discounts
    let auto_discounts = await this.context.discounts.list(['app:0'])
    auto_discounts = auto_discounts.map(t => t[1])
    console.log('auto_discounts', auto_discounts)
    return calculate_pricing(
      line_items, auto_discounts, coupons, shipping_method, uid
      )
  }

}