import { SQL } from '../driver.js'
import { sanitize_one } from './utils.funcs.js'
import { expand } from './con.shared.js'
import { query_to_eb, query_to_sort } from './utils.query.js'

/**
 * @typedef {import('@storecraft/core').db_tags} db_col
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
          trx.deleteFrom('tags').where(
            'id', '=', item.id).execute();
          trx.insertInto('tags').values(
            {
              created_at: item.created_at,
              updated_at: item.updated_at,
              id: item.id,
              handle: item.handle,
              values: JSON.stringify(item.values)
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
    const r = await driver.client.selectFrom('tags')
                 .selectAll()
                 .where((eb) => eb.or(
                  [
                    eb('id', '=', id_or_handle),
                    eb('handle', '=', id_or_handle),
                  ])).executeTakeFirst();

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
    const r = await driver.client.deleteFrom('tags')
            .where(
              (eb) => eb.or(
                [
                  eb('id', '=', id_or_handle),
                  eb('handle', '=', id_or_handle),
                ]
              )
            ).executeTakeFirst();
    
    return r.numDeletedRows>0;
  }
}

/**
 * @param {SQL} driver 
 * @returns {db_col["list"]}
 */
const list = (driver) => {
  return async (query) => {

    const items = await driver.client.selectFrom('tags')
              .selectAll()
              .where(
                (eb) => {
                  return query_to_eb(eb, query).eb;
                }
              ).orderBy(query_to_sort(query))
              .limit(query.limit ?? 10)
              .execute();


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
