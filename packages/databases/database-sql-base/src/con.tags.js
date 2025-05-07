/**
 * @import { db_tags as db_col } from '@storecraft/core/database'
 */
import { SQL } from '../index.js'
import { 
  count_regular, delete_me, delete_search_of, insert_search_of, 
  regular_upsert_me, where_id_or_handle_table, 
  with_media, with_search
} from './con.shared.js'
import { sanitize, sanitize_array } from './utils.funcs.js'
import { withQuery } from './utils.query.js'

export const table_name = 'tags'

/**
 * @param {SQL} driver 
 * @returns {db_col["upsert"]}
 */
const upsert = (driver) => {
  return async (item, search_terms) => {
    const c = driver.client;
    try {
      const t = await c.transaction().execute(
        async (trx) => {
          await insert_search_of(trx, search_terms, item.id, item.handle, table_name);
          await regular_upsert_me(trx, table_name, {
            active: item.active ? 1 : 0,
            description: item.description,
            created_at: item.created_at,
            updated_at: item.updated_at,
            id: item.id,
            handle: item.handle,
            attributes: JSON.stringify(item.attributes),
            values: JSON.stringify(item.values),
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
 * @returns {db_col["get"]}
 */
const get = (driver) => {
  return (id_or_handle, options) => {
    return driver.client
    .selectFrom(table_name)
    .selectAll()
    .select(eb => [
        with_search(eb, id_or_handle, driver.dialectType),
      ].filter(Boolean)
    )
    .where(where_id_or_handle_table(id_or_handle))
    .executeTakeFirst()
    .then(sanitize);
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
          await delete_search_of(trx, id_or_handle, id_or_handle, table_name);
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
          with_search(eb, eb.ref('tags.id'), driver.dialectType),
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
    remove: remove(driver),
    list: list(driver),
    count: count_regular(driver, table_name),
  }
}
