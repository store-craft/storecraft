import { SQL } from '../driver.js'
import { jsonArrayFrom } from './con.helpers.json.js';
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
  'ship': 'shipping_methods',
  'sf': 'storefronts',
  'tag': 'tags',
  'template': 'templates',
  'post': 'posts',
  
}

/**
 * @type {Record<keyof import('@storecraft/core/v-database').db_driver["resources"], string[]>}
 */
const resource_to_props = {
  'auth_users': ['id', 'handle'],
  'collections': ['id', 'handle'],
  'customers': ['id', 'handle'],
  'discounts': ['id', 'handle', 'title'],
  'images': ['id', 'handle', 'name'],
  'orders': ['id'],
  'products': ['id', 'handle', 'title'],
  'shipping_methods': ['id', 'handle', 'title'],
  'storefronts': ['id', 'handle', 'title'],
  'tags': ['id', 'handle'],
  'templates': ['id', 'handle', 'title'],
  'posts': ['id', 'handle', 'title'],
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
    const db = driver.client;
    
    const sts = db
    .selectNoFrom(
      eb => Object
        .entries(resource_to_props)
        .map(
          ([table_name, props]) => {
            // console.log(table_name, props)
            return jsonArrayFrom(
              eb
              .selectFrom(table_name)
              .select(props)
              .where(
                (eb) => {
                  return query_to_eb(eb, query, table_name);
                }
              )
              .orderBy(query_to_sort(query))
              .limit(query.limit ?? 5),
              driver.dialectType
            ).as(table_name)
          }
        )
    )
    
    /** @type {import('@storecraft/core/v-api').QuickSearchResult} */
    const items = await sts.executeTakeFirst();

    const sanitized = Object.fromEntries(
      Object.entries(items).filter(
        ([key, value]) => Boolean(value?.length)
      )
    );

    // console.log('sanitized', JSON.stringify(sanitized, null, 2))

    return sanitized;
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
