import { SQL } from '../driver.js'
import { delete_me, delete_search_of, expand, insert_search_of, 
  upsert_me, where_id_or_handle_table } from './con.shared.js'
import { query_to_eb, query_to_sort } from './utils.query.js'

/**
 * @typedef {import('@storecraft/core').db_tags} db_col
 */
export const table_name = 'tags'

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
          await insert_search_of(trx, item.search, item.id, item.handle);
          await upsert_me(trx, table_name, item.id, {
            created_at: item.created_at,
            updated_at: item.updated_at,
            id: item.id,
            handle: item.handle,
            values: JSON.stringify(item.values)
          });
          // await trx.deleteFrom(table_name).where(
          //   'id', '=', item.id).execute();
          // await trx.insertInto(table_name).values(
          //   {
          //     created_at: item.created_at,
          //     updated_at: item.updated_at,
          //     id: item.id,
          //     handle: item.handle,
          //     values: JSON.stringify(item.values)
          //   }
          // ).execute()
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
    const r = await driver.client.selectFrom(table_name)
                 .selectAll()
                 .where(where_id_or_handle_table(id_or_handle))
                 .executeTakeFirst();

    // r?.values && (r.values=JSON.parse(r.values));
    // try to expand relations
    expand([r], options?.expand);
    return r;
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

    const items = await driver.client.selectFrom(table_name)
              .selectAll()
              .where(
                (eb) => {
                  return query_to_eb(eb, query).eb;
                }
              ).orderBy(query_to_sort(query))
              .limit(query.limit ?? 10)
              .execute();

    // console.log(items)
    // try expand relations, that were asked
    expand(items, query?.expand);

    return items;
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
