/**
 * @import { db_auth_users as db_col } from '@storecraft/core/database'
 */
import { SQL } from '../index.js'
import { sanitize, sanitize_array } from './utils.funcs.js'
import { 
  count_regular, delete_me, insert_search_of, insert_tags_of, 
  regular_upsert_me, where_id_or_handle_table, with_media, with_tags
} from './con.shared.js'
import { query_to_eb, query_to_sort } from './utils.query.js';


export const table_name = 'auth_users';

/**
 * @param {SQL} driver 
 * @returns {db_col["upsert"]}
 */
const upsert = (driver) => {

  return async (item, search_terms=[]) => {
    const c = driver.client;
    try {
      const t = await c.transaction().execute(
        async (trx) => {

          await insert_tags_of(trx, item.tags, item.id, item.email, table_name);
          await insert_search_of(trx, search_terms, item.id, item.email, table_name);

          return await regular_upsert_me(trx, table_name, {
            confirmed_mail: item.confirmed_mail ? 1 : 0,
            email: item.email,
            handle: item.email,
            password: item.password ?? null,
            created_at: item.created_at,
            updated_at: item.updated_at,
            id: item.id,
            roles: JSON.stringify(item.roles),
            firstname: item.firstname,
            lastname: item.lastname
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
  return (id_or_email, options) => {
    return driver.client
      .selectFrom(table_name)
      .selectAll()
      .where(where_id_or_handle_table(id_or_email))
      .executeTakeFirst()
      .then(sanitize);
  }
}


/**
 * @param {SQL} driver 
 * @returns {db_col["getByEmail"]}
 */
const getByEmail = (driver) => {
  return async (email) => {
    return driver.client
      .selectFrom('auth_users')
      .selectAll().where('email', '=', email)
      .executeTakeFirst()
      .then(sanitize);
  }
}

/**
 * @param {SQL} driver 
 * @returns {db_col["remove"]}
 */
const remove = (driver) => {
  return async (id_or_email) => {
    try {
      await driver.client.transaction().execute(
        async (trx) => {
            
          // entities
          // delete me
          await delete_me(trx, table_name, id_or_email);
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

/**
 * @param {SQL} driver 
 * 
 * 
 * @returns {db_col["list"]}
 */
const list = (driver) => {
  return async (query) => {

    const items = await driver.client.selectFrom(table_name)
      .selectAll()
      .select(eb => [
        with_tags(eb, eb.ref('auth_users.id'), driver.dialectType),
        with_media(eb, eb.ref('auth_users.id'), driver.dialectType),
      ])
      .where(
        (eb) => {
          return query_to_eb(eb, query, table_name);
        }
      )
      .orderBy(query_to_sort(query, 'auth_users'))
      .limit(query.limitToLast ?? query.limit ?? 10)
      .execute();

    if(query.limitToLast) items.reverse();

    return sanitize_array(items);
  }
}

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
    list: list(driver),
    count: count_regular(driver, table_name),
  }
}
