import { ObjectId } from 'mongodb';

export const isDef = v => v!==undefined && v!==null;
export const isUndef = v => !isDef(v);

/**
 * 
 * @param  {...any} keys 
 * @returns 
 */
export const delete_keys = (...keys) => {

  /**
   * @template T
   * @param {T} o
   * @returns {T}
   */
  return (o) => {
    keys.forEach(k => {o?.[k] && delete o[k]} )
    return o
  }
}

/**
 * Sanitize hidden properties in-place
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
 * @template T
 * @param {T} o 
 * @returns {T}
 */
export const delete_id = o => {
  return delete_keys('_id')(o)
}

/**
 * Sanitize the mongo document before sending to client
 * @template T
 * @param {T} o 
 */
export const sanitize_one = o => {
  return sanitize_hidden(o)
}

/**
 * Sanitize the mongo document before sending to client
 * @template T
 * @param {T[]} o 
 */
export const sanitize_array = o => {
  return o.map(it => sanitize_hidden(it));
}

/**
 * 
 * @param {string} id 
 * @returns 
 */
export const to_objid = id => new ObjectId(id.split('_').at(-1))

/**
 * 
 * @param {string} handle_or_id 
 * @returns { {_id:ObjectId} | {handle: string}}
 */
export const handle_or_id = (handle_or_id) => {
  let r = {};
  try {
    r._id = to_objid(handle_or_id);
  } catch (e) {
    r.handle = handle_or_id;
  }
  return r;
}

/**
 * 
 * @param {string} v 
 */
export const isID = v => {
  return v.includes('_');
}