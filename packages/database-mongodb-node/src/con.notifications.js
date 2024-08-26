import { Collection } from 'mongodb'
import { MongoDB } from '../index.js'
import { count_regular, get_regular, list_regular, 
  remove_regular, upsert_regular } from './con.shared.js'
import { to_objid } from './utils.funcs.js';
import { add_search_terms_relation_on } from './utils.relations.js';
import { union } from '@storecraft/core/v-api/utils.func.js';

/**
 * @typedef {import('@storecraft/core/v-database').db_notifications} db_col
 */

/**
 * @param {MongoDB} d 
 * 
 * 
 * @returns {Collection<db_col["$type_get"]>}
 */
const col = (d) => d.collection('notifications');

/**
 * @param {MongoDB} driver 
 * 
 * @returns {db_col["upsert"]}
 */
const upsert = (driver) => {
  return (item, search_terms=[]) => {
    return upsertBulk(driver)([item], [search_terms]);
  }
}


/**
 * @param {MongoDB} driver 
 * 
 * 
 * @returns {db_col["upsertBulk"]}
 */
const upsertBulk = (driver) => {
  return async (items, search_terms=[]) => {

    items = items.map(item => ({...item}));
    items.forEach(
      (item, ix) => {
        item._id = to_objid(item.id);
        
        add_search_terms_relation_on(
          item, 
          union(item.search, search_terms[ix])
        );
      }
    );

    // SEARCH

    const res = await col(driver).insertMany(
      items
    );

    return true;
  }
}

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

/** 
 * @param {MongoDB} driver
 * 
 * 
 * @return {db_col & { _col: ReturnType<col>}}
 */
export const impl = (driver) => {
  
  return {
    _col: col(driver),
    get: get(driver),
    upsert: upsert(driver),
    upsertBulk: upsertBulk(driver),
    remove: remove(driver),
    list: list(driver),
    count: count(driver)
  }
}
