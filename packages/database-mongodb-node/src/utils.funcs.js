import { ObjectId } from 'mongodb';

/** @param {any} v */
export const isDef = v => v!==undefined && v!==null;

/** @param {any} v */
export const isUndef = v => !isDef(v);

/**
 * 
 * @param  {...any} keys 
 */
export const delete_keys = (...keys) => {

  /**
   * @template T
   * 
   * 
   * @param {T} o
   * 
   * 
   * @returns {T}
   */
  return (o) => {
    keys.forEach(k => {o?.[k] && delete o[k]});

    return o
  }
}

/**
 * Sanitize hidden properties in-place
 * 
 * 
 * @template {object} T
 * 
 * 
 * @param {T} o 
 * 
 * 
 * @return {Omit<T, '_id' | '_relations'>}
 * 
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
 * 
 * @template T
 * 
 * 
 * @param {T} o 
 * 
 * 
 * @returns {T}
 */
export const delete_id = o => {
  return delete_keys('_id')(o)
}

/**
 * 
 * Sanitize the mongo document before sending to client
 * 
 * @template T
 * 
 * 
 * @param {T} o 
 */
export const sanitize_one = o => {
  return sanitize_hidden(o)
}

/**
 * Sanitize the mongo document before sending to client
 * 
 * @template T
 * 
 * 
 * @param {T[]} o 
 * 
 */
export const sanitize_array = o => {
  return o?.map(sanitize_hidden);
}

/**
 * 
 * @param {string} id 
 * 
 */
export const to_objid = id => {
  return new ObjectId(id.split('_').at(-1))
}

/**
 * 
 * @param {string} id 
 * 
 */
export const to_objid_safe = id => {
  try {
    return  new ObjectId(id.split('_').at(-1))
  } catch(e) {
  }

  return undefined;
}

/**
 * @template {{handle?: string}} G
 * 
 * 
 * @param {string} handle_or_id 
 * 
 * 
 * @returns {import('mongodb').Filter<G>}
 */
export const handle_or_id = (handle_or_id) => {
  try {
    return {
      _id: to_objid(handle_or_id)
    }
  } catch (e) {
    return {
      handle: handle_or_id
    }
  }
}

