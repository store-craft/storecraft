import { Collection } from 'mongodb'
import { handle_or_id, isUndef, 
  to_objid } from './utils.funcs.js'
import { report_document_media } from './con.images.js'
import { SQL } from '../index.js'
import { ExpressionWrapper, InsertQueryBuilder, Transaction } from 'kysely'
import { jsonArrayFrom, stringArrayFrom } from './con.helpers.json.sqlite.js'

/**
 * @template T, G
 * @param {SQL} driver 
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
 * @template T
 * @param {T[]} items 
 * @param {import('@storecraft/core').ExpandQuery} expand 
 */
export const expand = (items, expand) => {
  return items;
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
 * @param {SQL} driver 
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
   * @param {import('kysely').ExpressionBuilder<Database>} eb 
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
   * @param {import('kysely').ExpressionBuilder<Database>} eb 
   */
  return (eb) => eb.or(
    [
      eb('id', '=', id_or_handle),
      eb('handle', '=', id_or_handle),
    ]
  );
}

/**
 * @typedef { keyof Pick<Database, 
 * 'entity_to_media' | 'entity_to_search_terms' 
 * | 'entity_to_tags_projections' | 'products_to_collections' 
 * | 'products_to_discounts'>
 * } EntityTableKeys
 */
/**
 * helper to generate entity values delete
 * @param {EntityTableKeys} entity_table_name 
 */
export const delete_entity_values_by_value_or_reporter = (entity_table_name) => {
  /**
   * 
   * @param {Transaction<Database>} trx 
   * @param {string} value delete by entity value
   * @param {string} [reporter] delete by reporter
   */
  return (trx, value, reporter=undefined) => {

    return trx.deleteFrom(entity_table_name).where(
      eb => eb.or(
        [
          value && eb('value', '=', value),
          reporter && eb('reporter', '=', reporter),
        ].filter(Boolean)
      )
    ).executeTakeFirst();
  }
}

/**
 * helper to generate entity values delete
 * @param {EntityTableKeys} entity_table_name 
 */
export const delete_entity_values_of_by_entity_id_or_handle = (entity_table_name) => {
  /**
   * 
   * @param {Transaction<import('../index.js').Database>} trx 
   * @param {string} entity_id delete by id
   * @param {string} [entity_handle=entity_id] delete by handle
   */
  return (trx, entity_id, entity_handle=undefined) => {
    return trx.deleteFrom(entity_table_name).where(
      eb => eb.or(
        [
          eb('entity_id', '=', entity_id),
          eb('entity_handle', '=', entity_handle ?? entity_id),
        ]
      )
    ).executeTakeFirst();
  }
}

/**
 * TODO: ADD PREFIX FOR HANDLES BECAUSE THEY CAN BE NON-UNIQUE CROSS TABLES
 * helper to generate entity values delete
 * @param {EntityTableKeys} entity_table_name 
 */
export const insert_entity_values_of = (entity_table_name) => {
  /**
   * 
   * @param {Transaction<Database>} trx 
   * @param {string[]} values values of the entity
   * @param {string} item_id whom the tags belong to
   * @param {string} [item_handle] whom the tags belong to
   * @param {boolean} [delete_previous=true] whom the tags belong to
   * @param {string} [reporter=undefined] the reporter of the value (another segment technique)
   * @param {string} [context=undefined] the context (another segment technique)
   */
  return async (trx, values, item_id, item_handle, delete_previous=true, reporter=undefined, context=undefined) => {
    if(delete_previous) {
      if(reporter) {
        await delete_entity_values_by_value_or_reporter(entity_table_name)(trx, undefined, reporter);
      } else {
        await delete_entity_values_of_by_entity_id_or_handle(entity_table_name)(trx, item_id, item_handle);
      }
    }

    if(!values?.length) return Promise.resolve();

    return await trx.insertInto(entity_table_name).values(
      values.map(t => ({
          entity_handle: item_handle,
          entity_id: item_id,
          value: t,
          reporter,
          context
        })
      )
    ).executeTakeFirst();
  }
}

export const delete_tags_of = delete_entity_values_of_by_entity_id_or_handle('entity_to_tags_projections');
export const insert_tags_of = insert_entity_values_of('entity_to_tags_projections');

export const delete_search_of = delete_entity_values_of_by_entity_id_or_handle('entity_to_search_terms');
export const insert_search_of = insert_entity_values_of('entity_to_search_terms');

export const delete_media_of = delete_entity_values_of_by_entity_id_or_handle('entity_to_media');
export const insert_media_of = insert_entity_values_of('entity_to_media');

/**
 * @typedef {import('../index.js').Database} Database
 */

/**
 * @template {keyof Database} T
 * @param {Transaction<Database>} trx 
 * @param {T} table_name 
 * @param {string} item_id 
 * @param {Parameters<InsertQueryBuilder<Database, T>["values"]>[0]} item values of the entity
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
  // console.log('delete ', id_or_handle)
  return await trx.deleteFrom(table_name).where(
    where_id_or_handle_table(id_or_handle)
  ).executeTakeFirst();
}

/**
 * 
 * @param {import('kysely').ExpressionBuilder<Database>} eb 
 * @param {string | ExpressionWrapper<Database>} id_or_handle 
 */
export const with_tags = (eb, id_or_handle) => {
  return stringArrayFrom(
    values_of_entity_table(eb, 'entity_to_tags_projections', id_or_handle)
    ).as('tags');
}

/**
 * 
 * @param {import('kysely').ExpressionBuilder<Database>} eb 
 * @param {string | ExpressionWrapper<Database>} id_or_handle 
 */
export const with_search = (eb, id_or_handle) => {
  return stringArrayFrom(
    values_of_entity_table(eb, 'entity_to_search_terms', id_or_handle)
    ).as('search');
}

/**
 * 
 * @param {import('kysely').ExpressionBuilder<Database>} eb 
 * @param {string | ExpressionWrapper<Database>} id_or_handle 
 */
export const with_media = (eb, id_or_handle) => {
  return stringArrayFrom(
    values_of_entity_table(eb, 'entity_to_media', id_or_handle)
    ).as('media');
}

/**
 * select as json array collections of a product
 * @param {import('kysely').ExpressionBuilder<import('../index.js').Database, 'products'>} eb 
 * @param {string | ExpressionWrapper<Database>} product_id_or_handle 
 */
export const products_with_collections = (eb, product_id_or_handle) => {
  return jsonArrayFrom(
    eb.selectFrom('collections')
      .select('collections.active')
      .select('collections.attributes')
      .select('collections.created_at')
      .select('collections.updated_at')
      .select('collections.description')
      .select('collections.title')
      .select('collections.handle')
      .select('collections.id')
      .select(eb => [
        with_tags(eb, eb.ref('collections.id')),
        with_media(eb, eb.ref('collections.id')),
      ])
      .where('collections.id', 'in', 
        eb => values_of_entity_table(
          eb, 'products_to_collections', product_id_or_handle
        )
      )
    ).as('collections');
}

/**
 * @typedef {keyof Pick<Database, 'entity_to_media' | 'entity_to_search_terms' | 'entity_to_tags_projections' | 'products_to_collections' | 'products_to_discounts'>} entity_junction_table_key 
 */

/**
 * Use this to extract an entity values by it's id or handle. We assume not many
 * entities values of course.
 * @param {import('kysely').ExpressionBuilder<Database>} eb 
 * @param {entity_junction_table_key} entity_junction_table 
 * @param {string | ExpressionWrapper<Database>} entity_id_or_handle 
 */
export const values_of_entity_table = (eb, entity_junction_table, entity_id_or_handle) => {
  return eb
    .selectFrom(entity_junction_table)
    .select(`${entity_junction_table}.value`)
    .where(eb2 => eb2.or(
      [
        eb2(`${entity_junction_table}.entity_id`, '=', entity_id_or_handle),
        eb2(`${entity_junction_table}.entity_handle`, '=', entity_id_or_handle),
      ]
      )
    )
    .orderBy(`${entity_junction_table}.id`);
}
