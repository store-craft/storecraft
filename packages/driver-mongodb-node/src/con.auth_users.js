import { Driver } from '../driver.js'
import { ObjectId } from 'mongodb'

/**
 * @typedef {import('@storecraft/core').db_auth_users} db_col
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
  return d.client.db(d.name).collection('auth_users')
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

    /** @type {import('@storecraft/core').AuthUserType} */
    const res = await col(driver).findOne(
      filter
    );

    return res
  }
}

/**
 * @param {Driver} driver 
 * @returns {db_col["getByEmail"]}
 */
const getByEmail = (driver) => {
  return async (email) => {
    const filter = { email: email };

    /** @type {import('@storecraft/core').AuthUserType} */
    const res = await col(driver).findOne(
      filter
    );

    return res
  }
}

/**
 * @param {Driver} driver 
 * @returns {db_col["remove"]}
 */
const remove = (driver) => {
  return async (id) => {
    const filter = { _id: to_objid(id) };

    /** @type {import('@storecraft/core').AuthUserType} */
    const res = await col(driver).findOneAndDelete(
      filter
    );

    return
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
    getByEmail: getByEmail(driver),
    upsert: upsert(driver),
    remove: remove(driver)
  }
}
