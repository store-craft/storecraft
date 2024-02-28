import { Collection } from '../data-api-client/index.js'
import { MongoDB } from '../driver.js'
import { handle_or_id, isUndef, sanitize_array, 
  sanitize_one, to_objid } from './utils.funcs.js'
import { query_to_mongo } from './utils.query.js'
import { report_document_media } from './con.images.js'

/**
 * @template T, G
 * @param {MongoDB} driver 
 * @param {Collection<G>} col 
 * @returns {import('@storecraft/core').db_crud<T, G>["upsert"]}
 */
export const upsert_regular = (driver, col) => {
  return async (data) => {

    try {
      const res = await col.updateOne(
        { _id: to_objid(data.id) }, 
        data,
        true
      );
  
      ////
      // REPORT IMAGES USAGE
      ////
      await report_document_media(driver)(data);
    } catch(e) {
      console.log(e);
      return false;
    } finally {
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
export const get_regular = (driver, col) => {
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
    const res = await col.findOneAndDelete( 
      handle_or_id(id_or_handle)
    );
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

