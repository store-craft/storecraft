/**
 * @import { QuickSearchResult } from '@storecraft/core/api'
 * @import { search as db_col, db_driver } from '@storecraft/core/database'
 */

import { SQL } from '../index.js'
import { jsonArrayFrom } from './con.helpers.json.js';
import { withQuery } from './utils.query.js';

/**
 * @type {(keyof db_driver["resources"])[]}
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
  'templates',
  'chats'
]

/**
 * @type {Record<string, keyof db_driver["resources"]>}
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
  'chat': 'chats',
}

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
  'chats': ['id', 'customer_email', 'customer_id'],
}

/**
 * @param {string} id 
 * @returns {keyof db_driver["resources"]}
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
 * @returns {db_col["quicksearch"]}
 */
export const quicksearch = (driver) => {
  return async (query) => {
    const db = driver.client;
    const expand = query.expand ?? ['*']; 
    const all = expand.includes('*');
    query.limit ??= 5;

    const sts = db
    .selectNoFrom(
      eb => Object
        .entries(resource_to_props)
        .filter(t => all || expand.includes(t[0]))
        .map(
          /**
           * @param {any} param0 
           */
          ([table_name, props]) => {
            // console.log(table_name, props)
            props
            return jsonArrayFrom(
              withQuery(
                eb
                .selectFrom(table_name)
                .select(props),
                query, table_name
              ),
              driver.dialectType
            ).as(table_name)
          }
        )
    )
    
    
    const items = (/** @type {QuickSearchResult} */(
      await sts.executeTakeFirst())
    );

    
    const sanitized = Object.fromEntries(
      Object.entries(items).filter(
        ([key, value]) => Boolean(value?.length)
      )
    );
    
    // console.log('items', JSON.stringify(items, null, 2))
    
    // console.log('sanitized', JSON.stringify(sanitized, null, 2))

    return sanitized;
  }
}

/** 
 * @param {SQL} driver
 * @return {db_col}
 */
export const impl = (driver) => {

  return {
    quicksearch: quicksearch(driver)
  }
}
