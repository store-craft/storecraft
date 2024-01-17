import { Driver } from '../driver.js'
import { ObjectId } from 'mongodb'

/**
 * @typedef {import('@storecraft/core').db_auth_users} db_auth_users
 */

/**
 * @param {Driver} d 
 */
const col = (d) => {
  return d.client.db('main').collection('auth_users')
}

/**
 * @param {Driver} driver 
 * @returns {db_auth_users["upsert"]}
 */
const upsert = (driver) => {
  return async (data) => {
    console.log(data.id)
    const filter = { id: data.id };
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
 * @returns {db_auth_users["get"]}
 */
const get = (driver) => {
  return async (id) => {
    const filter = { id: id };

    /** @type {import('@storecraft/core').AuthUserType} */
    const res = await col(driver).findOne(
      filter
    );

    return res
  }
}

/**
 * @param {Driver} driver 
 * @returns {db_auth_users["getByEmail"]}
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
 * @returns {db_auth_users["remove"]}
 */
const remove = (driver) => {
  return async (id) => {
    const filter = { id: id };

    /** @type {import('@storecraft/core').AuthUserType} */
    const res = await col(driver).findOneAndDelete(
      filter
    );

    return
  }
}


/** 
 * @param {Driver} driver
 * @return {db_auth_users}
 * */
export const auth_users = (driver) => {
  driver
  return {
    get: get(driver),
    getByEmail: getByEmail(driver),
    upsert: upsert(driver),
    remove: remove(driver)
  }
}
