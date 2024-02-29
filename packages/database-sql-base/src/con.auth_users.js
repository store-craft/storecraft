import { SQL } from '../driver.js'
import { handle_or_id, isID, sanitize_one, to_objid } from './utils.funcs.js'
import { expand } from './con.shared.js'

/**
 * @typedef {import('@storecraft/core').db_auth_users} db_col
 */

/**
 * @param {SQL} driver 
 * @returns {db_col["upsert"]}
 */
const upsert = (driver) => {
  return async (item) => {
    const c = driver.client;
    try {
      const t = await c.transaction().execute(
        async (trx) => {
          trx.deleteFrom('auth_users').where(
            'id', '=', item.id).execute();
          trx.insertInto('auth_users').values(
            {
              confirmed_mail: item.confirmed_mail ? 1 : 0,
              email: item.email,
              password: item.password,
              created_at: item.created_at,
              updated_at: item.updated_at,
              id: item.id,
              roles: JSON.stringify(item.roles),
            }
          ).execute()
        }
      );
    } catch(e) {
      console.log(e);
      return false;
    }
    return true;
  }
}

/**
 * @param {SQL} driver 
 * @returns {db_col["get"]}
 */
const get = (driver) => {
  return async (id_or_handle, options) => {
    const r = await driver.client.selectFrom('auth_users')
                 .selectAll()
                 .where((eb) => eb.or(
                  [
                    eb('id', '=', id_or_handle),
                  ])).executeTakeFirst();

    // try to expand relations
    expand([r], options?.expand);
    return sanitize_one(r);
  }
}


/**
 * @param {SQL} driver 
 * @returns {db_col["getByEmail"]}
 */
const getByEmail = (driver) => {
  return async (email) => {
    const r = await driver.client.selectFrom('auth_users')
            .selectAll().where(
              (eb) => eb.or(
                [
                  eb('email', '=', email),
                ]
              )
            ).executeTakeFirst();

    return sanitize_one(r);
  }
}

/**
 * @param {SQL} driver 
 * @returns {db_col["remove"]}
 */
const remove = (driver) => {
  return async (id) => {
    const r = await driver.client.deleteFrom('auth_users')
            .where(
              (eb) => eb.or(
                [
                  eb('id', '=', id),
                ]
              )
            ).executeTakeFirst();
    
    return r.numDeletedRows>0;
  }
}

/**
 * @param {SQL} driver 
 * @returns {db_col["removeByEmail"]}
 */
const removeByEmail = (driver) => {
  return async (email) => {
    const r = await driver.client.deleteFrom('auth_users')
            .where(
              (eb) => eb.or(
                [
                  eb('email', '=', email),
                ]
              )
            ).executeTakeFirst();
    
    return r.numDeletedRows>0;
  }
}

// /**
//  * @param {SQL} driver 
//  */
// const list = (driver) => list_regular(driver, col(driver));


/** 
 * @param {SQL} driver
 * @return {db_col}}
 * */
export const impl = (driver) => {

  return {
    get: get(driver),
    getByEmail: getByEmail(driver),
    upsert: upsert(driver),
    remove: remove(driver),
    removeByEmail: removeByEmail(driver),
    // list: list(driver)
  }
}
