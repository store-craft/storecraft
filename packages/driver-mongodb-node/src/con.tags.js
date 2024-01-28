import { Driver } from '../driver.js'
import { sanitize, to_objid } from './utils.funcs.js'
import { query_to_mongo } from './utils.query.js'

/**
 * @typedef {import('@storecraft/core').db_tags} db_col
 */


/**
 * @param {Driver} d 
 */
const col = (d) => {
  return d.client.db(d.name).collection('tags')
}

/**
 * @param {Driver} driver 
 * @returns {db_col["upsert"]}
 */
const upsert = (driver) => {
  return async (data) => {
    console.log(data.id)
    const filter = { _id: to_objid(data.id) };
    const replacement = { ...data };
    const options = { upsert: true };

    const res = await col(driver).replaceOne(
      filter, replacement, options
    );

    return;
  }
}

/**
 * @param {Driver} driver 
 * @returns {db_col["get"]}
 */
const get = (driver) => {
  return async (id_or_handle) => {
    const is_id = Boolean(id_or_handle?.includes('_'))

    // it is a handle
    if(!is_id) {
      return await getByHandle(driver)(id_or_handle);
    }

    const filter = { _id: to_objid(id_or_handle) };

    /** @type {import('@storecraft/core').TagType} */
    const res = await col(driver).findOne(
      filter
    );

    return sanitize(res)
  }
}

/**
 * @param {Driver} driver 
 * @returns {db_col["getByHandle"]}
 */
const getByHandle = (driver) => {
  return async (handle) => {
    const filter = { handle: handle };

    /** @type {import('@storecraft/core').TagType} */
    const res = await col(driver).findOne(
      filter
    );

    return sanitize(res)
  }
}

/**
 * @param {Driver} driver 
 * @returns {db_col["remove"]}
 */
const remove = (driver) => {
  return async (id) => {
    const filter = { _id: to_objid(id) };

    /** @type {import('@storecraft/core').TagType} */
    const res = await col(driver).findOneAndDelete(
      filter
    );

    return
  }
}

/**
 * @param {Driver} driver 
 * @returns {db_col["list"]}
 */
const list = (driver) => {
  return async (query) => {

    const { filter, sort } = query_to_mongo(query);

    console.log('query', query)
    console.log('filter', JSON.stringify(filter, null, 2))
    console.log('sort', sort)

    /** @type {db_col["$type"][]} */
    const res = await col(driver).find(
      filter,  {
        sort, limit: query.limit
      }
    ).toArray();

    return sanitize(res);
  }
}

/** 
 * @param {Driver} driver
 * @return {db_col}
 * */
export const impl = (driver) => {
  driver
  return {
    get: get(driver),
    getByHandle: getByHandle(driver),
    upsert: upsert(driver),
    remove: remove(driver),
    list: list(driver)
  }
}
