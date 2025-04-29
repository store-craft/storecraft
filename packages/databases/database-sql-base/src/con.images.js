/**
 * @import { db_images as db_col } from '@storecraft/core/database'
 * @import { Database } from '../types.sql.tables.js'
 */

import { func } from '@storecraft/core/api'
import { SQL } from '../index.js'
import { count_regular, delete_me, delete_search_of, 
  insert_search_of, regular_upsert_me, where_id_or_handle_table 
} from './con.shared.js'
import { sanitize, sanitize_array } from './utils.funcs.js'
import { withQuery } from './utils.query.js'
import { Transaction } from 'kysely'
import { ID } from '@storecraft/core/api/utils.func.js'
import { 
  image_url_to_handle, image_url_to_name 
} from '@storecraft/core/api/con.images.logic.js'

export const table_name = 'images'

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
          await insert_search_of(
            trx, search_terms, item.id, item.handle, table_name
          );
          await regular_upsert_me(trx, table_name, {
            created_at: item.created_at,
            updated_at: item.updated_at,
            id: item.id,
            handle: item.handle,
            name: item.name,
            url: item.url,
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
    const img = await driver.client
    .selectFrom(table_name)
    .selectAll()
    .where(where_id_or_handle_table(id_or_handle))
    .executeTakeFirst();

    try {
      await driver.client.transaction().execute(
        async (trx) => {
          // remove images -> media
          await trx
            .deleteFrom('entity_to_media')
            .where('value', '=', img.url)
            .execute();
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
 * report media usages
 * @param {SQL} driver 
 * @returns {db_col["report_document_media"]}
 */
export const report_document_media = (driver) => {
  /**
   * @param {Transaction<Database>} [transaction]
   */
  return async (item, transaction) => {
    if(!(item?.media?.length))
      return;
  
    /**
     * 
   * @param {Transaction<Database>} trx
     */
    const doit = async (trx) => {
      const dates = func.apply_dates({});

      const ms = item.media.map(
        m => (
          {
            handle: image_url_to_handle(m),
            url: m,
            name: image_url_to_name(m),
            id: ID('img'),
            created_at: dates.created_at,
            updated_at: dates.updated_at,
          }
        )
      );
      const handles = ms.map(m => m.handle);

      await trx.deleteFrom(table_name).where(
        'handle', 'in', handles
      ).execute();
      await trx.insertInto(table_name).values(
        ms
      ).execute();
      // search stuff
      // remove by reporter
      await trx.deleteFrom('entity_to_search_terms').where(
        eb => eb.and([
            eb('reporter', '=', item.id),
            eb('context', '=', table_name),
          ]
        )
      ).execute();
      const search = func.union(
        item['title'], func.to_tokens(item['title'])
      );
      if(search.length) {
        const A = ms.map(m => ({
            entity_id: m.id,
            entity_handle: m.handle,
            context: table_name,
            reporter: item.id
          })
        );

        const B = search.reduce(
          (p, c) => {
            p.push(...A.map(a => ({...a, value: c})));
            return p;
          }, []
        );
      
        await trx.insertInto('entity_to_search_terms').values(
          B
        ).execute();
      }
      
    }

    if(transaction) {
      await doit(transaction);
    } else {
      try {
        const t = await driver.client
          .transaction()
          .execute(doit);
      } catch(e) {
        console.log(e);
      }
    }
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
      .selectAll(),
      query, table_name
    ).execute()

      // .where(
      //   (eb) => {
      //     return query_to_eb(eb, query, table_name);
      //   }
      // )
      // .orderBy(query_to_sort(query, 'images')) // ts complains because `usage` field is absent
      // .limit(query.limitToLast ?? query.limit ?? 10)
      // .execute();

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
    report_document_media: report_document_media(driver),
    count: count_regular(driver, table_name),
  }
}
