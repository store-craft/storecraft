import { StorecraftAdminSDK } from '.'
import { MovingStatsInfo, MovingStatsProduct, 
         MovingStatsData, MovingStatsDay, LineItem} from './js-docs-types'

const NAME = 'stats'

const startOfDay = (millis=Date.now()) => {
  var d = new Date(millis)
  d.setUTCHours(0,0,0,0)
  return d.getTime()  
}

const endOfDay = (millis=Date.now()) => {
  var d = new Date(millis)
  d.setUTCHours(23,59,59,999)
  return d.getTime()  
}

const MINUTE = 60000
const HOUR = 3600000
const DAY = 86400000

const test =
{
  "info": {
      "days": {
          "20": {
              "products": {
                  "jax-and-daxter-093384": {
                      "handle": "jax-and-daxter-093384",
                      "val": 1,
                      "title": "Jax and Daxter 2"
                  },
                  "call-of-duty-615788": {
                      "handle": "call-of-duty-615788",
                      "val": 1,
                      "title": "call of duty"
                  }
              },
              "collections": {
                  "ps2-games": 2,
                  "erer": 2,
                  "discount-erer": 1
              },
              "tags": {
                  "console_ps2": 2,
                  "condition_cib": 1,
                  "genre_action": 1,
                  "fsf_wewe": 1
              },
              "discounts": {
                  "tomerik": 1
              },
              "total": 1043,
              "orders": 1,
              "day": 1669507200000
          },
          "39": {
              "products": {
                  "test-668977": {
                      "handle": "test-668977",
                      "val": 1,
                      "title": "testee"
                  },
                  "ff-740642": {
                      "handle": "ff-740642",
                      "val": 1,
                      "title": "ff"
                  }
              },
              "collections": {
                  "erer": 2
              },
              "tags": {
                  "condition_second": 1,
                  "condition_new": 1,
                  "console_ps3": 1,
                  "a_b": 1
              },
              "discounts": {
                  "disc11": 1,
                  "erer": 1
              },
              "total": 2333,
              "orders": 1,
              "day": 1671148800000
          },
          "87": {
              "products": {
                  "aa": {
                      "handle": "aa",
                      "val": 1
                  },
                  "f": {
                      "handle": "f",
                      "val": 1
                  }
              },
              "collections": {},
              "tags": {},
              "discounts": {
                  "disc11": 1,
                  "blah": 1,
                  "tomerik": 1
              },
              "total": 557,
              "orders": 2,
              "day": 1675296000000
          }
      },
      "maxOrderTime": 1675369138699
  },
  "fromDay": 1667779200000,
  "toDay": 1675641599999,
  "updatedAt": 1675618634039
}

/**@type {MovingStatsInfo} */
const DEF_INFO = {
  days: {},
  maxOrderTime: 0,
}

export default class Stats  {
  /**
   * 
   * @param {StorecraftAdminSDK} context 
   */
  constructor(context) {
    this.context = context
    this.db = context.db    
    this.cache = {
    }
  }

  /**
   * Get the count of documents in a query of a collection
   * @param {string} colId collection ID
   * @param {string[]} search Array of search terms
   */
  countOf = (colId, search=[]) => {
    let q = {}
    if (Array.isArray(search) && search.length)
      q.where = [ ['search', 'array-contains-any', search] ]

    return this.db.col(colId).count(q)
  }

  /** @returns {boolean} */
  isCacheValid = key => {
    return this.cache[key] && 
    (Date.now()-this.cache[key].updatedAt)<HOUR
  }

  /**
   * 
   * @param {string} key 
   * @returns {MovingStatsData | undefined}
   */
  fromCache = (key) => {
    if(this.isCacheValid(key))
      return this.cache[key]
    return undefined
  }

  /**
   * 
   * @param {string} key 
   * @param {MovingStatsData} val 
   */
  putCache = (key, val) => {
    this.cache[key] = val
  }

  /**
   * 
   * @param {number} topK 
   * @param {boolean} reset 
   * 
   */
  loadOrdersStats = async (topK=10, reset=false) => {

    const stat_name = 'moving_orders_90_days_v2'
    if(this.isCacheValid(stat_name))
      return this.fromCache(stat_name)

    const fs = this.context.firebase.db
    try {
      const result = await runTransaction(
        fs,
        async t => {
          //
          const doc_ref = doc(fs, NAME, stat_name)
          /**@type {DocumentSnapshot<MovingStatsData>} */
          const snap = await t.get(doc_ref)
          /**@type {[boolean, string, MovingStatsData]} */
          // let [exists, id, old_data={ info: DEF_INFO }] = 
          //           await  this.db.doc(NAME, stat_name).get(false)
          const old_data = snap.data() ?? { info: DEF_INFO }
          // console.log('old_data12 ', old_data);

          const toDay = endOfDay(Date.now())
          const fromDay = startOfDay(toDay - 90*DAY)
          let cut = Math.max(old_data?.info?.maxOrderTime ?? 0, fromDay)
          
          // create base info
          // and delete older days, that we recorded
          let info = { ...old_data.info }
          info.days = Object.fromEntries(
            Object.entries(info.days)
                  .filter(([d, _]) => d >= fromDay)
          )

          // query new orders from db
          const r = await this.context.orders.listWithQuery({
            orderBy: [['createdAt', 'asc']], 
            where: [['createdAt', '>', cut]], 
            limit: 0
          })

          // console.log('cut ', cut)
          // console.log('r ', r)
    
          // process days stats
          info = r.reduce(
            (p, c) => {
              const [
                id, { 
                  pricing: { 
                    total: total_order_price,
                    evo
                  }, 
                  line_items, createdAt 
                }
              ] = c
              
              const day = startOfDay(createdAt)
              // const day_n = day//Math.floor((day - fromDay)/DAY)
              const day_d = p.days[day] = p.days[day] ?? {
                products: {},
                collections: {},
                tags: {},
                discounts: {}
              }

              // update total and number of orders
              const total = (day_d.total ?? 0) + total_order_price
              const orders = (day_d.orders ?? 0) + 1

              // iterate line items to collect used 
              // products/discounts/collections/tags
              // embedded in the line items
              line_items.forEach(li => {

                /**@type {LineItem} data */
                const { id, qty, data={} } = li
                const { handle, collections, tags, title } = data
                
                // products
                if(day_d.products[id] === undefined)
                  day_d.products[id] = { handle : id, val : 0, title }

                day_d.products[id].val += qty

                // collections
                collections?.forEach(
                  (k) => {
                    day_d.collections[k] = (day_d.collections[k] ?? 0) + 1
                  }
                )

                // tags
                tags?.forEach(
                  (k) => {
                    day_d.tags[k] = (day_d.tags[k] ?? 0) + 1
                  }
                )
              })

              // discounts
              evo?.filter(
                e => Boolean(e?.total_discount > 0) && (typeof e?.discount_code === 'string')
              ).forEach(
                (e) => {
                  const code = e?.discount_code
                  day_d.discounts[code] = (day_d.discounts[code] ?? 0) + 1
                }
              )

              p.maxOrderTime = Math.max(p.maxOrderTime, createdAt)
              p.days[day] = {
                ...day_d,
                total,
                orders,
                day
              }

              return p
            }, info
          )
      
          /**@type {MovingStatsData} */
          const new_data = { 
            info, fromDay, toDay, updatedAt: Date.now()
          }

          t.set(doc_ref, new_data)
          // await this.db.doc(NAME, stat_name).set(new_data)
          this.putCache(stat_name, new_data)
          return new_data

          //
        }, {
          maxAttempts: 1
        }
      )

      return result

    } catch (e) {
      console.log(e);
      throw e
    }
  }

  /**
   * 
   * @param {string} id 
   * @returns {any}
   */
  get = (id) => this.db.doc(NAME, id).get()

}