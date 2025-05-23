/**
 * @import { db_notifications as db_col } from '@storecraft/core/database'
 */
import { SQL } from '../index.js'
import { 
  count_regular, delete_me, delete_search_of, 
  insert_search_of, regular_upsert_me, where_id_or_handle_table, 
  with_search 
} from './con.shared.js'
import { sanitize_array } from './utils.funcs.js'
import { withQuery } from './utils.query.js'

export const table_name = 'notifications'

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
          await insert_search_of(
            trx, 
            [...item.search, ...search_terms], 
            item.id, item.id, table_name
          );
          await regular_upsert_me(trx, table_name, {
            handle: null,
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
  return async (items, search_terms) => {
    const results = [];
    // for (const it of items)
    for(let ix = 0; ix < items.length; ix++) {
      results.push(
        await upsert(driver)(
          items[ix], search_terms?.[ix]
        )
      );
    }

    return results.every(b => b);
  }
}

/**
 * @param {SQL} driver 
 * @returns {db_col["get"]}
 */
const get = (driver) => {
  return (id_or_handle, options) => {
    return driver.client
    .selectFrom(table_name)
    .selectAll()
    .select(eb => [
      with_search(eb, eb.ref('notifications.id'), driver.dialectType),
    ]
    .filter(Boolean))
    .where(where_id_or_handle_table(id_or_handle))
    .executeTakeFirst();
  }
}


/**
 * @param {SQL} driver 
 * @returns {db_col["remove"]}
 */
const remove = (driver) => {
  return async (id_or_handle) => {
    try {
      await driver.client.transaction().execute(
        async (trx) => {
          // entities
          await delete_search_of(trx, id_or_handle);
          // delete me
          await delete_me(trx, table_name, id_or_handle);
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
 * @returns {db_col["list"]}
 */
const list = (driver) => {
  return async (query) => {

    const items = await withQuery(
      driver.client
      .selectFrom(table_name)
      .selectAll()
      .select(
        eb => [
          with_search(eb, eb.ref('notifications.id'), driver.dialectType),
        ].filter(Boolean)
      ),
      query, table_name
    ).execute();

    if(query.limitToLast) 
      items.reverse();

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
    list: list(driver),
    count: count_regular(driver, table_name),
  }
}
