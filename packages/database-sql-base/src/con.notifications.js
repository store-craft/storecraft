import { SQL } from '../driver.js'
import { delete_me, delete_search_of, 
  insert_search_of, upsert_me, where_id_or_handle_table, 
  with_search } from './con.shared.js'
import { sanitize_array, sanitize } from './utils.funcs.js'
import { query_to_eb, query_to_sort } from './utils.query.js'

/**
 * @typedef {import('@storecraft/core').db_notifications} db_col
 */
export const table_name = 'notifications'

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
          await insert_search_of(trx, item.search, item.id, item.id);
          await upsert_me(trx, table_name, item.id, {
            created_at: item.created_at,
            updated_at: item.updated_at,
            message: item.message,
            author: item.author,
            id: item.id,
            actions: JSON.stringify(item.actions)
          });
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
 * @returns {db_col["upsertBulk"]}
 */
const upsertBulk = (driver) => {
  return async (data) => {

    const results = await Promise.all(
      data.map(item => upsert(driver)(item))
    )

    return results.every(b => b);
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
      .select(eb => [
        with_search(eb, eb.ref('notifications.id')),
      ].filter(Boolean))
      .where(where_id_or_handle_table(id_or_handle))
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
          await delete_search_of(trx, id_or_handle);
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
 * @returns {db_col["list"]}
 */
const list = (driver) => {
  return async (query) => {

    const items = await driver.client
      .selectFrom(table_name)
      .selectAll()
      .select(eb => [
        with_search(eb, eb.ref('notifications.id')),
      ].filter(Boolean))
      .where(
        (eb) => {
          return query_to_eb(eb, query, table_name).eb;
        }
      )
      .orderBy(query_to_sort(query))
      .limit(query.limit ?? 10)
      .execute();

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
    upsert: upsert(driver),
    upsertBulk: upsertBulk(driver),
    remove: remove(driver),
    list: list(driver)
  }
}
