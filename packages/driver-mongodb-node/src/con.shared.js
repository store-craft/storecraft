import { Collection } from 'mongodb'
import { Driver } from '../driver.js'
import { sanitize, to_objid } from './utils.funcs.js'
import { query_to_mongo } from './utils.query.js'

/**
 * @template {import('@storecraft/core').BaseType} T
 * @param {Driver} driver 
 * @param {Collection<T>} col 
 * @returns {import('@storecraft/core').db_crud<T>["upsert"]}
 */
export const upsert_regular = (driver, col) => {
  return async (data) => {
    
    const filter = { _id: to_objid(data.id) };
    const replacement = { ...data };
    const options = { upsert: true };

    const res = await col.replaceOne(
      filter, replacement, options
    );

    return;
  }
}

/**
 * @template {import('@storecraft/core').BaseType} T
 * @param {Driver} driver 
 * @param {Collection<T>} col 
 * @returns {import('@storecraft/core').db_crud<T>["get"]}
 */
export const get_regular = (driver, col) => {
  return async (id_or_handle) => {
    const is_id = Boolean(id_or_handle?.includes('_'))

    // it is a handle
    if(!is_id) {
      return await getByHandle_regular(driver, col)(id_or_handle);
    }

    const filter = { _id: to_objid(id_or_handle) };

    const res = await col.findOne(
      filter
    );

    return sanitize(res)
  }
}

/**
 * @template {import('@storecraft/core').BaseType} T
 * @param {Driver} driver 
 * @param {Collection<T>} col 
 * @returns {import('@storecraft/core').db_crud<T>["getByHandle"]}
 */
export const getByHandle_regular = (driver, col) => {
  return async (handle) => {
    const filter = { handle: handle };

    const res = await col.findOne(
      filter
    );

    return sanitize(res)
  }
}

/**
 * @template {import('@storecraft/core').BaseType} T
 * @param {Driver} driver 
 * @param {Collection<T>} col 
 * @returns {import('@storecraft/core').db_crud<T>["remove"]}
 */
export const remove_regular = (driver, col) => {
  return async (id) => {
    const filter = { _id: to_objid(id) };

    const res = await col.findOneAndDelete(
      filter
    );

    return
  }
}

/**
 * @template {import('@storecraft/core').BaseType} T
 * @param {Driver} driver 
 * @param {Collection<T>} col 
 * @returns {import('@storecraft/core').db_crud<T>["list"]}
 */
export const list_regular = (driver, col) => {
  return async (query) => {

    const { filter, sort } = query_to_mongo(query);

    console.log('query', query)
    console.log('filter', JSON.stringify(filter, null, 2))
    console.log('sort', sort)

    /** @type {import('@storecraft/core').db_crud<T>["$type"][]} */
    const res = await col.find(
      filter,  {
        sort, limit: query.limit
      }
    ).toArray();

    return sanitize(res);
  }
}

