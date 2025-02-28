import { Kysely } from 'kysely'
import { SQL } from '../index.js'
import { count_regular, delete_me, delete_search_of, insert_search_of, 
  regular_upsert_me, safe_trx, where_id_or_handle_table } from './con.shared.js'
import { sanitize, sanitize_array } from './utils.funcs.js'
import { query_to_eb, query_to_sort } from './utils.query.js'
import { base64 } from '@storecraft/core/crypto';

/**
 * @typedef {import('@storecraft/core/database').db_templates} db_col
 */
export const table_name = 'templates'

/**
 * @description if `base64_` prefixed then decode the postfix and return it,
 * otherwise, just return the original value.
 * @param {string} val 
 */
const decode_if_base64 = val => {
  if(!val.startsWith('base64_'))
    return val;

  const b64 = val.split('base64_').at(1) ?? '';
  return base64.decode(b64);
}

/**
 * @param {Kysely<import('../index.js').Database>} client 
 * 
 * 
 * @returns {db_col["upsert"]}
 */
export const upsert = (client) => {
  return async (item, search_terms) => {
    try {
      const t2 = await safe_trx(client).execute(
        async (trx) => {
          
          await insert_search_of(trx, search_terms, item.id, item.handle, table_name);
          await regular_upsert_me(trx, table_name, {
            created_at: item.created_at,
            updated_at: item.updated_at,
            id: item.id,
            title: item.title,
            handle: item.handle,
            template_html: decode_if_base64(item.template_html),
            template_text: decode_if_base64(item.template_text),
            reference_example_input: JSON.stringify(item.reference_example_input ?? {})
          });
        }
      )
      
    } catch(e) {
      console.log(e);
      return false;
    }
    return true;
  }
}


/**
 * @param {SQL} driver 
 * 
 * 
 * @returns {db_col["get"]}
 */
const get = (driver) => {
  return (id_or_handle, options) => {
    return driver.client
    .selectFrom(table_name)
    .selectAll()
    .where(where_id_or_handle_table(id_or_handle))
    .executeTakeFirst()
    .then(sanitize);
  }
}


/**
 * @param {SQL} driver 
 * 
 * 
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

    const items = await driver.client
      .selectFrom(table_name)
      .selectAll()
      .where(
        (eb) => {
          return query_to_eb(eb, query, table_name);
        }
      )
      .orderBy(query_to_sort(query, table_name))
      .limit(query.limitToLast ?? query.limit ?? 10)
      .execute();

    if(query.limitToLast) items.reverse();
    
    return sanitize_array(items);
  }
}


/** 
 * @param {SQL} driver
 * 
 * 
 * @return {db_col}}
 */
export const impl = (driver) => {

  return {
    get: get(driver),
    upsert: upsert(driver.client),
    remove: remove(driver),
    list: list(driver),
    count: count_regular(driver, table_name),
  }
}
