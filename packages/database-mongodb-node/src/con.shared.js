import { Collection } from 'mongodb'
import { MongoDB } from '../driver.js'
import { handle_or_id, isUndef, sanitize_array, 
  sanitize_one, to_objid } from './utils.funcs.js'
import { query_to_mongo } from './utils.query.js'
import { report_document_media } from './con.images.js'
import { add_search_terms_relation_on } from './utils.relations.js'


/**
 * @template {import('@storecraft/core/v-api').BaseType} T
 * @template {import('@storecraft/core/v-api').BaseType} G
 * 
 * 
 * @param {MongoDB} driver 
 * @param {Collection<G>} col 
 * 
 * 
 * @returns {import('@storecraft/core/v-database').db_crud<T, G>["upsert"]}
 * 
 */
export const upsert_regular = (driver, col) => {
  return async (data, search_terms=[]) => {

    data = {...data};
    
    const session = driver.mongo_client.startSession();

    try {
      await session.withTransaction(
        async () => {
          // SEARCH
          add_search_terms_relation_on(
            data, 
            [
              ...search_terms
            ]
          );

          const res = await col.replaceOne(
            // @ts-ignore
            { 
              _id: to_objid(data.id) 
            }, 
            data,
            { 
              session, upsert: true 
            }
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
 * 
 * 
 * @template {import('./utils.relations.js').WithRelations<{}>} T
 * 
 * 
 * @param {T} item
 */
export const get_relations_names = item => {
  return Object.keys(item?._relations ?? {});
}

/**
 * Expand relations in-place
 * 
 * 
 * @template {any} T
 * 
 * 
 * @param {import('./utils.relations.js').WithRelations<T>[]} items
 * @param {import('@storecraft/core/v-api').ExpandQuery} [expand_query] 
 * 
 */
export const expand = (items, expand_query=undefined) => {
  
  if(isUndef(expand_query) || !Array.isArray(items))
    return items;

  items = items.filter(Boolean)

  const all = expand_query.includes('*');
  
  for(const item of items) {
    expand_query = all ? get_relations_names(item) : expand_query;

    for(const e of (expand_query ?? [])) {
      // try to find embedded documents relations
      const rel = item?._relations?.[e];
      if(rel===undefined || rel===null)
        continue;
      
      item[e] = [];

      if(Array.isArray(rel)) {
        item[e] = rel;
      } else if(rel?.entries) {
        // recurse
        item[e] = sanitize_array(
          expand(
            Object.values(rel.entries),
            ['*']
          )
        );
      }
    }
  }

  return items;
}


export const zeroed_relations = {
  '_relations.discounts': 0,
  '_relations.collections': 0,
  '_relations.variants': 0,
  '_relations.related_products': 0,
  '_relations.search': 0,
  '_relations.posts': 0,
  '_relations.products': 0,
  '_relations.shipping_methods': 0,
} 


/**
 * 
 * @param {import('@storecraft/core/v-database').RegularGetOptions["expand"]} expand 
 */
export const expand_to_mongo_projection = (expand) => {
  let projection = {}

  if(!expand?.includes('*')) {
    projection = zeroed_relations;

    expand?.forEach(
      it => {
        delete projection[`_relations.${it}`];
      }
    )
  }

  return projection;
}

/**
 * @template T, G
 * 
 * 
 * @param {MongoDB} driver 
 * @param {Collection<G>} col 
 * 
 * 
 * @returns {import('@storecraft/core/v-database').db_crud<T, G>["get"]}
 */
export const get_regular = (driver, col) => {
  return async (id_or_handle, options) => {
    const filter = handle_or_id(id_or_handle);

    /** @type {import('./utils.relations.js').WithRelations<import('mongodb').WithId<G>>} */
    const res = await col.findOne(
      filter,
      {
        projection: expand_to_mongo_projection(options?.expand)
      }
    );

    // try to expand relations
    expand([res], options?.expand);

    return sanitize_one(res);
  }
}

/**
 * get bulk of items, ordered, if something is missing, `undefined`
 * should be instead
 * 
 * 
 * @template {import('@storecraft/core/v-api').idable} T
 * @template {import('@storecraft/core/v-api').idable} G
 * 
 * 
 * @param {MongoDB} driver 
 * @param {Collection<G>} col 
 * 
 * 
 * @returns {import('@storecraft/core/v-database').db_crud<T, G>["getBulk"]}
 */
export const get_bulk = (driver, col) => {
  return async (ids, options) => {
    const objids = ids.map(handle_or_id)
                      .map(v => ('_id' in v) ? v._id : undefined)
                      .filter(Boolean);



    const res = await col.find(
      // @ts-ignore
      { 
        $or: [
          {
            _id: { $in: objids } 
          },
          {
            handle: { $in: ids } 
          }
        ]
      }
    ).toArray();

    // try to expand relations
    expand(res, options?.expand);
    const sanitized = sanitize_array(res);
// console.log('res', sanitized)
    // now let's order them
    return ids.map(
      id => sanitized.find(s => s.id===id || s?.handle===id)
    );
    
  }
}


/**
 * @template T, G
 * 
 * 
 * @param {MongoDB} driver 
 * @param {Collection<G>} col 
 * 
 * 
 * @returns {import('@storecraft/core/v-database').db_crud<T, G>["remove"]}
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
 * 
 * 
 * @param {MongoDB} driver 
 * @param {Collection<G>} col 
 * 
 * 
 * @returns {import('@storecraft/core/v-database').db_crud<T, G>["list"]}
 */
export const list_regular = (driver, col) => {
  return async (query) => {

    const { filter, sort, reverse_sign } = query_to_mongo(query);

    // console.log('reverse_sign', reverse_sign)
    // console.log('query', query)
    // console.log('filter', JSON.stringify(filter, null, 2))
    // console.log('sort', sort)
    // console.log('expand', query?.expand)

    /** @type {import('mongodb').WithId<G>[]} */
    const items = await col.find(
      filter,  {
        sort, 
        limit: reverse_sign==-1 ? query.limitToLast : query.limit,
        projection: expand_to_mongo_projection(query?.expand)
      }
    ).toArray();

    if(reverse_sign==-1) items.reverse();

    // try expand relations, that were asked
    const items_expended = expand(items, query?.expand);

    const sanitized = sanitize_array(items_expended);

    // console.log('sanitized', sanitized)

    return sanitized;
  }
}

/**
 * @template {any} T
 * @template {any} G
 * 
 * 
 * @param {MongoDB} driver 
 * @param {Collection<G>} col 
 * 
 * 
 * @returns {import('@storecraft/core/v-database').db_crud<T, G>["count"]}
 */
export const count_regular = (driver, col) => {
  return async (query) => {

    const { filter } = query_to_mongo(query);

    // console.log('query', query);
    // console.log('filter', JSON.stringify(filter, null, 2));

    const count = await col.countDocuments(
      filter
    );

    return count;
  }
}

