import { Collection } from 'mongodb'
import { MongoDB } from '../driver.js'
import { handle_or_id, isUndef, sanitize, to_objid } from './utils.funcs.js'
import { query_to_mongo } from './utils.query.js'
import { report_document_media } from './con.images.js'

/**
 * @template {import('@storecraft/core').BaseType} T
 * @param {MongoDB} driver 
 * @param {Collection<T>} col 
 * @returns {import('@storecraft/core').db_crud<T>["upsert"]}
 */
export const upsert_regular = (driver, col) => {
  return async (data) => {
    
    const filter = { _id: to_objid(data.id) };
    const replacement = { ...data };
    const options = { upsert: true };

    const res = await col.replaceOne(
      filter, replacement, options
    );

    ////
    // REPORT IMAGES USAGE
    ////
    await report_document_media(driver)(data);

    return;
  }
}

/**
 * 
 * @param {import('@storecraft/core').ExpandQuery} expand 
 */
const gen_lookup = expand => {
  // const r = await col.aggregate(
  //   [
  //     { $match : filter },
  //     ...gen_lookup(options.expand)
  //   ]
  // ).toArray();

  return (expand??[]).map(
    e => {
      return {
        $lookup: { 
          from: e, localField: `_${e}`, 
          foreignField: '_id', as: e 
        }
      }
    }
  )
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
 * @template {import('@storecraft/core').BaseType} T
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
      item[e] = sanitize(Object.values(item?._relations?.[e]?.entries ?? {}));
    }
  }
}


/**
 * @template {import('@storecraft/core').BaseType} T
 * @param {MongoDB} driver 
 * @param {Collection<T>} col 
 * @returns {import('@storecraft/core').db_crud<T>["get"]}
 */
export const get_regular = (driver, col) => {
  return async (id_or_handle, options) => {
    const filter = handle_or_id(id_or_handle);
    /** @type {import('./utils.relations.js').WithRelations<T>} */
    const res = await col.findOne(filter);
    // try to expand relations
    expand([res], options?.expand);
    return sanitize(res);
  }
}

/**
 * get bulk of items, ordered, if something is missing, `undefined`
 * should be instead
 * @template {import('@storecraft/core').BaseType} T
 * @param {MongoDB} driver 
 * @param {Collection<T>} col 
 * @returns {import('@storecraft/core').db_crud<T>["getBulk"]}
 */
export const get_bulk = (driver, col) => {
  return async (ids, options) => {
    const objids = ids.map(to_objid);

    /** @type {import('./utils.relations.js').WithRelations<T>[]} */
    const res = await col.find(
      { _id: { $in: objids } }
    ).toArray();

    // try to expand relations
    expand(res, options?.expand);
    const sanitized = sanitize(res);
    // now let's order them
    return ids.map(
      id => sanitized.find(s => s.id===id)
    );
    
  }
}


/**
 * @template {import('@storecraft/core').BaseType} T
 * @param {MongoDB} driver 
 * @param {Collection<T>} col 
 * @returns {import('@storecraft/core').db_crud<T>["remove"]}
 */
export const remove_regular = (driver, col) => {
  return async (id) => {
    const filter = { _id: to_objid(id) };

    const res = await col.findOneAndDelete( 
      filter
    );

    return
  }
}

/**
 * @template {import('@storecraft/core').BaseType} T
 * @param {MongoDB} driver 
 * @param {Collection<T>} col 
 * @returns {import('@storecraft/core').db_crud<T>["list"]}
 */
export const list_regular = (driver, col) => {
  return async (query) => {

    const { filter, sort } = query_to_mongo(query);

    console.log('query', query)
    console.log('filter', JSON.stringify(filter, null, 2))
    console.log('sort', sort)
    console.log('expand', query?.expand)

    /** @type {import('@storecraft/core').db_crud<T>["$type"][]} */
    const items = await col.find(
      filter,  {
        sort, limit: query.limit
      }
    ).toArray();

    // try expand relations, that were asked
    expand(items, query?.expand);

    return sanitize(items);
  }
}

