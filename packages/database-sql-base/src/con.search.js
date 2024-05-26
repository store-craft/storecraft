import { SQL } from '../driver.js'
import { query_to_eb, query_to_sort } from './utils.query.js';

/**
 * @typedef {import('@storecraft/core/v-database').search} db_col
 */



/**
 * @type {(keyof import('@storecraft/core/v-database').db_driver["resources"])[]}
 */
const tables = [
  'tags',
  'collections',
  'customers',
  'products',
  'storefronts',
  'images',
  'posts',
  'shipping_methods',
  'notifications',
  'discounts',
  'orders',
  'templates'
]

/**
 * @type {Record<string, keyof import('@storecraft/core/v-database').db_driver["resources"]>}
 */
const prefix_to_resource = {
  'au': 'auth_users',
  'col': 'collections',
  'cus': 'customers',
  'dis': 'discounts',
  'img': 'images',
  'not': 'notifications',
  'order': 'orders',
  'pr': 'products',
  'ship': 'shipping',
  'sf': 'storefronts',
  'tag': 'tags',
  'template': 'templates',
  'post': 'posts',
  
}

/**
 * 
 * @param {string} id 
 * 
 * @returns {keyof import('@storecraft/core/v-database').db_driver["resources"]}
 */
export const id_to_resource = id => {
  let result = undefined;
  try {
    const prefix = id.split('_').at(0);
    result = prefix_to_resource[prefix];
  } catch(e) {

  } finally {
    return result;
  }
}

/**
 * @param {SQL} driver 
 * 
 * 
 * @returns {db_col["quicksearch"]}
 */
export const quicksearch = (driver) => {
  return async (query) => {

    const sts = driver.client
    .selectFrom(tables[0])
    .selectAll()
    .where(
      (eb) => {
        return query_to_eb(eb, query, 'collections');
      }
    )
    .orderBy(query_to_sort(query))
    .limit(query.limit ?? 5)
    



  }
}

/** 
 * @param {SQL} driver
 * 
 * 
 * @return {db_col}
 * */
export const impl = (driver) => {

  return {
    quicksearch: quicksearch(driver)
  }
}
