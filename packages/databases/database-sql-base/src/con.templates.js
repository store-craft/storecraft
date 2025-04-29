/**
 * @import { db_templates as db_col } from '@storecraft/core/database'
 * @import { Database } from '../types.sql.tables.js'
 */
import { Kysely } from 'kysely'
import { SQL } from '../index.js'
import { count_regular, delete_me, delete_search_of, insert_search_of, 
  regular_upsert_me, safe_trx, where_id_or_handle_table, 
  with_search} from './con.shared.js'
import { sanitize, sanitize_array } from './utils.funcs.js'
import { withQuery } from './utils.query.js'
import { base64 } from '@storecraft/core/crypto';

export const table_name = 'templates'

/**
 * @description if `base64_` prefixed then decode the postfix and return it,
 * otherwise, just return the original value.
 * @param {string} val 
 */
const encode_base64_if_needed = val => {
  if(val?.startsWith('base64_'))
    return val;

  return 'base64_' + base64.encode(val);
}

/**
 * @description if `base64_` prefixed then decode the postfix and return it,
 * otherwise, just return the original value.
 * @param {string} val 
 */
const decode_base64_if_needed = val => {
  if(!val?.startsWith('base64_'))
    return val;

  return base64.decode(val.split('base64_').at(-1) ?? '');
}

/**
 * @param {Kysely<Database>} client 
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
            active: item.active ? 1 : 0,
            title: item.title,
            handle: item.handle,
            template_html: item.template_html && encode_base64_if_needed(item.template_html),
            template_text: item.template_text && encode_base64_if_needed(item.template_text),
            template_subject: item.template_subject && encode_base64_if_needed(item.template_subject),
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
 * @returns {db_col["get"]}
 */
export const get = (driver) => {
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
    .then(sanitize)
    .then(
      (item) => {
        if(!item) return null;

        item.template_html = decode_base64_if_needed(item.template_html);
        item.template_text = decode_base64_if_needed(item.template_text);
        item.template_subject = decode_base64_if_needed(item.template_subject);

        return item;
      }
    )
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
          with_search(eb, eb.ref('templates.id'), driver.dialectType),
        ].filter(Boolean)
      ),
      query, table_name
    )
    .execute()
    .then(
      (items) => {
        return items.map(
          (item) => {
            item.template_html = decode_base64_if_needed(item.template_html);
            item.template_text = decode_base64_if_needed(item.template_text);
            item.template_subject = decode_base64_if_needed(item.template_subject);
            return item;
          }
        )
      }
    );

    if(query.limitToLast) 
      items.reverse();
    
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
