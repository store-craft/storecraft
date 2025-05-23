/**
 * @import { WithRelations } from './utils.types.js';
 * @import { Filter } from 'mongodb';
 */
import { ObjectId } from 'mongodb';

/** @param {any} v */
export const isDef = v => v!==undefined && v!==null;

/** @param {any} v */
export const isUndef = v => !isDef(v);

/**
 * @param  {...any} keys 
 */
export const delete_keys = (...keys) => {

  /**
   * @template T
   * @param {T} o
   * @returns {T}
   */
  return (o) => {
    keys.forEach(k => {o?.[k] && delete o[k]});

    return o
  }
}

/**
 * @description Sanitize hidden properties in-place
 * @template {object} T
 * @param {T} o 
 * @return {Omit<T, '_id' | '_relations'>}
 */
export const sanitize_hidden = o => {
  if(!isDef(o))
    return o;

  for (const k of Object.keys(o)) {
    if(k.startsWith('_'))
      delete o[k];
  }
  return o;
}

/**
 * @description Sanitize hidden properties in-place recursively
 * @template {object} T
 * @param {T} o 
 * @return {Omit<T, '_id' | '_relations'>}
 */
export const sanitize_recursively = o => {
  for(const k of Object.keys(o)) {
    if(k.startsWith('_')) {
      delete o[k];
    } else if(typeof o[k] === 'object') {
      sanitize_recursively(o[k]);
    }
  }
  return o;
}

/**
 * @description Sanitize the mongo document before sending to client
 * @template T
 * @param {WithRelations<T>} o 
 */
export const sanitize_one = o => {
  return sanitize_hidden(o)
}

/**
 * @description Sanitize the mongo document before sending to client
 * @template T
 * @param {WithRelations<T>[]} o 
 */
export const sanitize_array = o => {
  return o?.map(sanitize_hidden);
}

/**
 * @template T
 * @param {T} o 
 * @returns {T}
 */
export const delete_id = o => {
  return delete_keys('_id')(o)
}

/**
 * @param {string} id 
 */
export const to_objid = id => {
  return new ObjectId(id.split('_').at(-1))
}

/**
 * @param {string} id 
 */
export const to_objid_safe = id => {
  try {
    return  new ObjectId(id.split('_').at(-1))
  } catch(e) {
  }

  return undefined;
}

/**
 * @description Create a `filter` for `object-id` or `handle`
 * @template {{handle?: string}} G
 * @param {string} handle_or_id 
 * @returns {Filter<G>}
 */
export const handle_or_id = (handle_or_id) => {
  return objid_or_else_filter(handle_or_id, 'handle');
}


/**
 * @template {{handle?: string}} G
 * @param {string} id_or_else 
 * @returns {Filter<G>}
 */
export const objid_or_else_filter = (id_or_else, else_key='handle') => {
  try {
    // @ts-ignore
    return {
      _id: to_objid(id_or_else)
    }
  } catch (e) {
    // @ts-ignore
    return {
      [else_key]: id_or_else
    }
  }
}

