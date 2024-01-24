import { Driver } from '../driver.js'
import { ObjectId } from 'mongodb'
import { delete_id, delete_keys } from './utils.js'

/**
 * @typedef {import('@storecraft/core').db_tags} db_col
 */

/**
 * 
 * @param {string} id 
 * @returns 
 */
const to_objid = id => new ObjectId(id.split('_').at(-1))

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
  return async (id) => {
    const filter = { _id: to_objid(id) };

    /** @type {import('@storecraft/core').TagType} */
    const res = await col(driver).findOne(
      filter
    );

    return delete_id(res)
  }
}

/**
 * @param {Driver} driver 
 * @returns {db_col["get"]}
 */
const getByHandle = (driver) => {
  return async (handle) => {
    const filter = { handle: handle };

    /** @type {import('@storecraft/core').TagType} */
    const res = await col(driver).findOne(
      filter
    );

    return delete_id(res)
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

    return [
      { handle: 'a1'},
      { handle: 'a2'},
    ]
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
 