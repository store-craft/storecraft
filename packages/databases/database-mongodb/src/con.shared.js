/**
 * @import { db_crud, withConcreteId, withConcreteIdAndHandle } from '@storecraft/core/database'
 * @import { 
 *  BaseType, ExpandQuery, withOptionalID 
 * } from '@storecraft/core/api'
 * @import { WithRelations } from './utils.types.js'
 * @import { WithId } from 'mongodb'
 */
import { Collection } from 'mongodb'
import { MongoDB } from '../index.js'
import { 
  handle_or_id, isUndef, sanitize_array, 
  sanitize_one, to_objid 
} from './utils.funcs.js'
import { query_to_mongo } from './utils.query.js'
import { report_document_media } from './con.images.js'
import { add_search_terms_relation_on } from './utils.relations.js'


/**
 * @description Upsert function for MongoDB
 * @template {Partial<withConcreteIdAndHandle<{}>>} T
 * @template {Partial<withConcreteIdAndHandle<{}>>} G
 * @param {MongoDB} driver 
 * @param {Collection<G>} col 
 * @param {(input: T) => T} [hook_pre_write=x=>x] 
 * @returns {db_crud<T, G>["upsert"]}
 */
export const upsert_regular = (driver, col, hook_pre_write=x=>x) => {
  
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

          // if(!data.handle) {
          //   throw new Error('Handle is required');
          // }

          await col.deleteMany(
            // @ts-ignore
            {
              $or: [
                data.id && { _id: to_objid(data.id) },
                data.handle && { handle: data.handle }
              ].filter(Boolean)
            },
            {
              session
            }
          );

          await col.insertOne(
            // @ts-ignore
            {
              ...hook_pre_write(data),
              _id: data.id ? to_objid(data.id) : undefined,
            },
            { 
              session,
            }

          );

          ////
          // REPORT IMAGES USAGE
          ////
          await report_document_media(driver)(data, session);
        }
      );
    } catch(e) {
      console.log(e);

      return false;
    } finally {
      await session.endSession();
    }

    return true;
  }
}

/**
 * @description Extract relations names from item
 * @template {WithRelations<{}>} T
 * @param {T} item
 */
export const get_relations_names = item => {
  return Object.keys(item?._relations ?? {});
}

/**
 * @description Expand relations in-place
 * @template {any} T
 * @param {WithRelations<T>[]} items
 * @param {ExpandQuery<T>} [expand_query] 
 */
export const expand = (items, expand_query=undefined) => {
  
  if(isUndef(expand_query) || !Array.isArray(items))
    return items;

  items = items.filter(Boolean)

  const all = expand_query.includes('*');
  
  for(const item of items) {
    const what_to_expand = all ? get_relations_names(item) : expand_query;

    for(const e of (what_to_expand ?? [])) {
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
 * @template T
 * @param {ExpandQuery<T>} expand 
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
 * @param {MongoDB} driver 
 * @param {Collection<G>} col 
 * @param {(input: G) => G} [hook_post=x=>x] 
 * @returns {db_crud<T, G>["get"]}
 */
export const get_regular = (driver, col, hook_post=x=>x) => {
  return async (id_or_handle, options) => {
    const filter = handle_or_id(id_or_handle);

    /** @type {WithRelations<WithId<G>>} */
    const res = await col.findOne(
      filter,
      {
        projection: expand_to_mongo_projection(options?.expand)
      }
    );

    // try to expand relations
    expand(
      [res], 
      /** @type {ExpandQuery<WithId<G>>} */(
        options?.expand
      )
    );

    return /** @type {G} */(
      hook_post(
        /** @type {G} */(sanitize_one(res))
      )
    );
  }
}

/**
 * @description get bulk of items, ordered, if something is missing, `undefined`
 * should be instead
 * @template {withOptionalID} T
 * @template {withOptionalID} G
 * @param {MongoDB} driver 
 * @param {Collection<G>} col 
 * @returns {db_crud<T, G>["getBulk"]}
 */
export const get_bulk = (driver, col) => {
  return async (ids, options) => {
    const objids = ids
    .map(handle_or_id)
    .map(v => ('_id' in v) ? v._id : undefined)
    .filter(Boolean);

    const res = /** @type {(WithRelations<WithId<G>>)[]} */ (
      await col.find(
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
      ).toArray()
    );

    // try to expand relations
    expand(
      res, 
      /** @type {ExpandQuery<WithId<G>>} */ (
        options?.expand
      )
    );
    
    const sanitized = /** @type {G[]} */(
      /** @type {unknown} */(
        sanitize_array(res)
      )
    );

    // now let's order them
    return ids.map(
      id => sanitized.find(
        s => s.id===id || s?.['handle']===id
      )
    );
    
  }
}


/**
 * @template T, G
 * @param {MongoDB} driver 
 * @param {Collection<G>} col 
 * @returns {db_crud<T, G>["remove"]}
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
 * @template T
 * @template G
 * @param {MongoDB} driver 
 * @param {Collection<G>} col 
 * @returns {db_crud<T, G>["list"]}
 */
export const list_regular = (driver, col) => {
  return async (query) => {

    const { filter, sort, reverse_sign } = query_to_mongo(query);

    // console.log('reverse_sign', reverse_sign)
    // console.log('query', query)
    // console.log('filter', JSON.stringify(filter, null, 2))
    // console.log('sort', sort)
    // console.log('expand', query?.expand)

    /** @type {WithRelations<WithId<G>>[]} */
    const items = await col.find(
      filter, 
      {
        sort, 
        limit: reverse_sign==-1 ? query.limitToLast : query.limit,
        projection: expand_to_mongo_projection(query?.expand)
      }
    ).toArray();

    if(reverse_sign==-1) items.reverse();

    // try expand relations, that were asked
    const items_expended = expand(
      items, 
      /** @type {ExpandQuery<WithId<G>>} */ (
        query?.expand
      )
    );
    
    const sanitized = sanitize_array(items_expended);

    // console.log('sanitized', sanitized)

    return /** @type {G[]} */(sanitized);
  }
}

/**
 * @template {any} T
 * @template {any} G
 * @param {MongoDB} driver 
 * @param {Collection<G>} col 
 * @returns {db_crud<T, G>["count"]}
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

