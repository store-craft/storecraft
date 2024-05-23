import { Collection } from 'mongodb'
import { MongoDB } from '../driver.js'
import { count_regular, expand, expand_to_mongo_projection, get_regular, 
  remove_regular, upsert_regular } from './con.shared.js'
import { query_to_mongo } from './utils.query.js';
import { sanitize_array } from './utils.funcs.js';

/**
 * @typedef {import('@storecraft/core/v-database').db_tags} db_col
 */


/**
 * @param {MongoDB} d 
 * 
 * 
 * @returns {Collection<db_col["$type_get"]>}
 */
const col = (d) => d.collection('tags');

/**
 * @param {MongoDB} driver 
 * 
 * @returns {db_col["upsert"]}
 */
const upsert = (driver) => upsert_regular(driver, col(driver));

/**
 * @param {MongoDB} driver 
 */
const get = (driver) => get_regular(driver, col(driver));

/**
 * @param {MongoDB} driver 
 */
const remove = (driver) => remove_regular(driver, col(driver));

/**
 * @param {MongoDB} driver 
 */
const list = (driver) => list_regular(driver, col(driver));

/**
 * @param {MongoDB} driver 
 */
const count = (driver) => count_regular(driver, col(driver));

const tables = [
  'tags',
  'collections',
  'customers',
  'products',
  'storefronts',
  'images',
  'posts',
  'shipping',
  'notifications',
  'discounts',
  'orders',
  'templates',
]


/**
 * @template {any} T
 * @template {any} G
 * 
 * 
 * @param {MongoDB} driver 
 * @param {Collection<G>} col 
 * 
 * 
 * @returns {import('@storecraft/core/v-database').db_crud<T, G>["list"]}
 */
export const search = (driver) => {
  return async (query) => {

    const { filter, sort, reverse_sign } = query_to_mongo(query);

    // console.log('reverse_sign', reverse_sign)
    // console.log('query', query)
    // console.log('filter', JSON.stringify(filter, null, 2))
    // console.log('sort', sort)
    // console.log('expand', query?.expand)

    // /** @type {import('mongodb').WithId<G>[]} */
    // const items222 = await col(driver).find(
    //   filter,  {
    //     sort, 
    //     limit: reverse_sign==-1 ? query.limitToLast : query.limit,
    //     projection: expand_to_mongo_projection(query?.expand)
    //   }
    // ).toArray();

    // if(reverse_sign==-1) items.reverse();

    const pipeline = [
      {
        "$match": filter
      },
      {
        $sort: sort
      },
      {
        $limit: 5
      },
      {
        $project: { 
          title: 1,
          handle: 1,
          id: 1,
          _id: 0
        }
      }
    ];

    const items = await col(driver).aggregate(
      [
        ...pipeline,
        ...tables.map(
          t => (
            {
              $unionWith: {
                coll: t,
                pipeline: pipeline
              }
            }
          )
        )
        // {
        //   "$unionWith": {
        //     "coll": "products",
        //     pipeline: pipeline
        //   }
        // }
      ], 
      {
        
      }
    ).toArray();

    return items;
  }
}

/** 
 * @param {MongoDB} driver
 * 
 * 
 * @sreturn {db_col & { _col: ReturnType<col>}}
 * */
export const impl = (driver) => {

  return {
    _col: col(driver),
    search: search(driver)
  }
}
