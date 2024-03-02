import { Collection } from 'mongodb'
import { handle_or_id, isUndef, 
  sanitize_one, to_objid } from './utils.funcs.js'
import { report_document_media } from './con.images.js'
import { SQL } from '../index.js'
import { InsertQueryBuilder, Transaction } from 'kysely'
import { stringArrayFrom } from './con.helpers.json.sqlite.js'

/**
 * @template T, G
 * @param {MongoDB} driver 
 * @param {Collection<G>} col 
 * @returns {import('@storecraft/core').db_crud<T, G>["upsert"]}
 */
export const upsert_regular = (driver, col) => {
  return async (data) => {

    

    const session = driver.mongo_client.startSession();

    try {
      await session.withTransaction(
        async () => {
          const res = await col.replaceOne(
            { _id: to_objid(data.id) }, 
            data,
            { session, upsert: true }
          );
      
          ////
          // REPORT IMAGES USAGE
          ////
          await report_document_media(driver)(data, session);
        }
      );
    } catch(e) {
      // console.log(e);
      return false;
    } finally {
      await session.endSession();
    }

    return true;
  }
}

/**
 * Extract relations names from item
 * @template {import('./utils.relations.js').WithRelations<{}>} T
 * @param {T} item
 */
export const get_relations_names = item => {
  return Object.keys(item?._relations ?? {});
}

/**
 * Expand relations in-place
 * @template {any} T
 * @param {T[]} items
 * @param {import('@storecraft/core').ExpandQuery} [expand_query] 
 */
export const expand = (items, expand_query=undefined) => {
  if(isUndef(expand_query))
    return;

  const all = expand_query.includes('*');
  
  for(const item of items) {
    expand_query = all ? get_relations_names(item) : expand_query;

    for(const e of (expand_query ?? [])) {
      // try to find embedded documents relations
      item[e] = sanitize_array(Object.values(item?._relations?.[e]?.entries ?? {}));
    }
  }
}


/**
 * @template T, G
 * @param {MongoDB} driver 
 * @param {Collection<G>} col 
 * @returns {import('@storecraft/core').db_crud<T, G>["get"]}
 */
export const get_regular33 = (driver, col) => {
  return async (id_or_handle, options) => {
    const filter = handle_or_id(id_or_handle);
    /** @type {import('./utils.relations.js').WithRelations<G>} */
    const res = await col.findOne(filter);
    // try to expand relations
    expand([res], options?.expand);
    return sanitize_one(res);
  }
}

/**
 * @template T, G
 * @param {SQL} driver 
 * @param {keyof import('../index.js').Database} table_name 
 * @returns {import('@storecraft/core').db_crud<T, G>["get"]}
 */
export const get_regular = (driver, table_name) => {
  return async (id_or_handle, options) => {
    const r = await driver.client.selectFrom(table_name)
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
 * get bulk of items, ordered, if something is missing, `undefined`
 * should be instead
 * @template {import('@storecraft/core').idable} T
 * @template {import('@storecraft/core').idable} G
 * @param {MongoDB} driver 
 * @param {Collection<G>} col 
 * @returns {import('@storecraft/core').db_crud<T, G>["getBulk"]}
 */
export const get_bulk = (driver, col) => {
  return async (ids, options) => {
    const objids = ids.map(to_objid);

    const res = await col.find(
      { _id: { $in: objids } }
    ).toArray();

    // try to expand relations
    expand(res, options?.expand);
    const sanitized = sanitize_array(res);

    // now let's order them
    return ids.map(
      id => sanitized.find(s => s.id===id)
    );
    
  }
}


/**
 * @template T, G
 * @param {MongoDB} driver 
 * @param {Collection<G>} col 
 * @returns {import('@storecraft/core').db_crud<T, G>["remove"]}
 */
export const remove_regular = (driver, col) => {
  return async (id_or_handle) => {
    const res = await col.deleteOne( 
      handle_or_id(id_or_handle)
    );
    return res.acknowledged && res.deletedCount>0;
  }
}

/**
 * @template {any} T
 * @template {any} G
 * @param {MongoDB} driver 
 * @param {Collection<G>} col 
 * @returns {import('@storecraft/core').db_crud<T, G>["list"]}
 */
export const list_regular = (driver, col) => {
  return async (query) => {

    const { filter, sort } = query_to_mongo(query);

    // console.log('query', query)
    // console.log('filter', JSON.stringify(filter, null, 2))
    // console.log('sort', sort)
    // console.log('expand', query?.expand)

    /** @type {import('mongodb').WithId<G>[]} */
    const items = await col.find(
      filter,  {
        sort, limit: query.limit
      }
    ).toArray();

    // try expand relations, that were asked
    expand(items, query?.expand);

    return sanitize_array(items);
  }
}

/////
/////
/////

/**
 * 
 * @param {string} id_or_handle
 */
export const where_id_or_handle_entity = (id_or_handle) => {
  /**
   * @param {import('kysely').ExpressionBuilder<import('../index.js').Database>} eb 
   */
  return (eb) => eb.or(
    [
      eb('entity_handle', '=', id_or_handle),
      eb('entity_id', '=', id_or_handle),
    ]
  );
}

/**
 * 
 * @param {string} id_or_handle
 */
export const where_id_or_handle_table = (id_or_handle) => {
  /**
   * @param {import('kysely').ExpressionBuilder<import('../index.js').Database>} eb 
   */
  return (eb) => eb.or(
    [
      eb('id', '=', id_or_handle),
      eb('handle', '=', id_or_handle),
    ]
  );
}


/**
 * helper to generate entity values delete
 * @param {keyof import('../index.js').Database} entity_table_name 
 */
export const delete_entity_values_of = (entity_table_name) => {
  /**
   * 
   * @param {Transaction<import('../index.js').Database>} trx 
   * @param {string} id_or_handle whom the tags belong to
   */
  return async (trx, id_or_handle) => {
    return await trx.deleteFrom(entity_table_name).where(
      where_id_or_handle_entity(id_or_handle)
    ).executeTakeFirst();
  }
}

/**
 * TODO: ADD PREFIX FOR HANDLES BECAUSE THEY CAN BE NON-UNIQUE CROSS TABLES
 * helper to generate entity values delete
 * @param {keyof import('../index.js').Database} entity_table_name 
 */
export const insert_entity_values_of = (entity_table_name) => {
  /**
   * 
   * @param {Transaction<import('../index.js').Database>} trx 
   * @param {string[]} values values of the entity
   * @param {string} item_id whom the tags belong to
   * @param {string} [item_handle] whom the tags belong to
   * @param {boolean} [delete_previous=true] whom the tags belong to
   */
  return async (trx, values, item_id, item_handle, delete_previous=true) => {
    if(delete_previous)
      await delete_entity_values_of(entity_table_name)(trx, item_id ?? item_handle);

    if(!values?.length) return Promise.resolve();

    return await trx.insertInto(entity_table_name).values(
      values.map(t => ({
          entity_handle: item_handle,
          entity_id: item_id,
          value: t
        })
      )
    ).executeTakeFirst();
  }
}

export const delete_tags_of = delete_entity_values_of('entity_to_tags_projections');
export const insert_tags_of = insert_entity_values_of('entity_to_tags_projections');

export const delete_search_of = delete_entity_values_of('entity_to_search_terms');
export const insert_search_of = insert_entity_values_of('entity_to_search_terms');

export const delete_media_of = delete_entity_values_of('entity_to_media');
export const insert_media_of = insert_entity_values_of('entity_to_media');

/**
 * @typedef {import('../index.js').Database} Database
 * 
 * @param {Transaction<Database>} trx 
 * @param {keyof Database} table_name 
 * @param {string} item_id 
 * @param {Parameters<InsertQueryBuilder<Database>["values"]>[0]} item values of the entity
 */
export const upsert_me = async (trx, table_name, item_id, item) => {
  await trx.deleteFrom(table_name).where('id', '=', item_id).execute();
  return await trx.insertInto(table_name).values(item).executeTakeFirst()
}


/**
 * 
 * @param {Transaction<Database>} trx 
 * @param {keyof Database} table_name 
 * @param {string} id_or_handle 
 */
export const delete_me = async (trx, table_name, id_or_handle) => {
  return await trx.deleteFrom(table_name).where(
    where_id_or_handle_table(id_or_handle)
  ).executeTakeFirst();
}

/**
 * 
 * @param {import('kysely').ExpressionBuilder<import('../index.js').Database>} eb 
 * @param {keyof import('../index.js').Database} table 
 */
export const with_tags = (eb, table) => {
  return stringArrayFrom(
    eb.selectFrom('entity_to_tags_projections')
      .select('entity_to_tags_projections.value')
      .whereRef('entity_to_tags_projections.entity_id', '=', `${table}.id`)
      .orderBy('entity_to_tags_projections.id')
    ).as('tags');
}
