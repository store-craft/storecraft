import { SQL } from '../driver.js'
import { delete_me, delete_media_of, delete_search_of, delete_tags_of, expand, 
  insert_media_of, insert_search_of, insert_tags_of, 
  upsert_me, where_id_or_handle_table, 
  with_media, 
  with_tags} from './con.shared.js'
import { sanitize_array, sanitize } from './utils.funcs.js'
import { query_to_eb, query_to_sort } from './utils.query.js'


/**
 * @typedef {import('@storecraft/core').db_collections} db_col
 */
export const table_name = 'collections'

/**
 * @param {SQL} driver 
 * @returns {db_col["upsert"]}
 */
const upsert = (driver) => {
  return async (item) => {
    const c = driver.client;
    try {
      const t = await driver.client.transaction().execute(
        async (trx) => {

          // entities
          const tt1 = await insert_tags_of(trx, item.tags, item.id, item.handle);
          const tt2 = await insert_search_of(trx, item.search, item.id, item.handle);
          const tt3 = await insert_media_of(trx, item.media, item.id, item.handle);
          // main
          await upsert_me(trx, table_name, item.id, {
            
            created_at: item.created_at,
            updated_at: item.updated_at,
            id: item.id,
            handle: item.handle,
            active: item.active ? 1 : 0,
            attributes: JSON.stringify(item.attributes),
            description: item.description,
            published: item.published,
            title: item.title
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
  return async (id_or_handle, options) => {

    const r = await driver.client
      .selectFrom(table_name)
      .selectAll('collections')
      .select(eb => [
        with_tags(eb, eb.ref('collections.id')),
        with_media(eb, eb.ref('collections.id'))
      ])
      .where(where_id_or_handle_table(id_or_handle))
    //  .compile()
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
          await delete_tags_of(trx, id_or_handle);
          await delete_search_of(trx, id_or_handle);
          await delete_media_of(trx, id_or_handle);
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

    const items = await driver.client.selectFrom(table_name)
      .selectAll()
      .select(eb => [
        with_tags(eb, eb.ref('collections.id')),
        with_media(eb, eb.ref('collections.id')),
      ])
      .where(
        (eb) => {
          return query_to_eb(eb, query).eb;
        }
      ).orderBy(query_to_sort(query))
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
    remove: remove(driver),
    list: list(driver)
  }
}
