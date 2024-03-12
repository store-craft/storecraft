import { SQL } from '../driver.js'
import { sanitize } from './utils.funcs.js'
import { delete_me, upsert_me, 
  where_id_or_handle_table } from './con.shared.js'

/**
 * @typedef {import('@storecraft/core/v-database').db_auth_users} db_col
 */

export const table_name = 'auth_users';

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
          return await upsert_me(trx, table_name, item.id, {
            confirmed_mail: item.confirmed_mail ? 1 : 0,
            email: item.email,
            password: item.password,
            created_at: item.created_at,
            updated_at: item.updated_at,
            id: item.id,
            roles: JSON.stringify(item.roles),
          });
        }
      );
      return t.numInsertedOrUpdatedRows>0;
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
    const r = await driver.client
      .selectFrom(table_name)
      .selectAll()
      .where(where_id_or_handle_table(id_or_handle))
      .executeTakeFirst();

    return sanitize(r);
  }
}


/**
 * @param {SQL} driver 
 * @returns {db_col["getByEmail"]}
 */
const getByEmail = (driver) => {
  return async (email) => {
    const r = await driver.client
      .selectFrom('auth_users')
      .selectAll().where('email', '=', email)
      .executeTakeFirst();
    return sanitize(r);
  }
}

/**
 * @param {SQL} driver 
 * @returns {db_col["remove"]}
 */
const remove = (driver) => {
  return async (id_or_handle) => {
    try {
      const t = await driver.client.transaction().execute(
        async (trx) => {
            
          // entities
          // delete me
          const d2 = await delete_me(trx, table_name, id_or_handle);
          return d2.numDeletedRows>0;
        }
      );
      return t;
    } catch(e) {
      console.log(e);
      return false;
    }
    return true;
  }
}
/**
 * @param {SQL} driver 
 * @returns {db_col["removeByEmail"]}
 */
const removeByEmail = (driver) => {
  return async (email) => {
    const r = await driver.client
      .deleteFrom('auth_users')
      .where('email', '=', email)
      .executeTakeFirst();
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
