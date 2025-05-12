/**
 * @import { search as db_col, db_driver } from '@storecraft/core/database'
 * @import { QuickSearchResource, QuickSearchResult } from '@storecraft/core/api'
 */
import { MongoDB } from '../index.js'
import { query_to_mongo } from './utils.query.js';

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
 * @param {MongoDB} driver 
 * @returns {db_col["quicksearch"]}
 */
export const quicksearch = (driver) => {
  return async (query) => {

    const { filter, sort, reverse_sign } = query_to_mongo(query);
    const expand = query.expand ?? ['*']; 
    const tables_filtered = tables.filter(
      t => expand.includes('*') || expand.includes(t)
    );

    if(tables_filtered.length==0)
      return {};

    const pipeline = [
      {
        "$match": filter
      },
      {
        $sort: sort
      },
      {
        $limit: query.limit ?? 5
      },
      {
        $project: { 
          id: 1,
          handle: 1,

          title: 1,
          name: 1,

          customer_email: 1,
          customer_id: 1,

          _id: 0
        }
      }
    ];

    const db = driver.mongo_client.db(driver.name);
    const items = /** @type {QuickSearchResource[]} */ (
      await db.collection(tables_filtered[0]).aggregate(
        [
          ...pipeline,
          ...tables_filtered.slice(1).map(
            t => (
              {
                $unionWith: {
                  coll: t,
                  pipeline: pipeline
                }
              }
            )
          )
        ], 
        {
        }
      ).toArray()
    );


    /** @type {QuickSearchResult} */
    const result = {};

    items.reduce(
      (p, c) => {
        const resource = id_to_resource(c.id);
        const resource_meta = p[resource];

        if(resource_meta) {
          resource_meta.push(c);
        } else {
          p[resource] = [
            c
          ]
        }
        
        return p;
      }, 
      result
    );

    return result;
  }
}

/** 
 * @param {MongoDB} driver
 * @return {db_col}
 */
export const impl = (driver) => {

  return {
    quicksearch: quicksearch(driver)
  }
}
