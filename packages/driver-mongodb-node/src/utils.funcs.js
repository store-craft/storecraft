import { ObjectId } from 'mongodb';

/**
 * @template T
 * @param  {...string} keys 
 * @returns 
 */

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
 * @returns {T}
 */
export const sanitize = o => {
  if(Array.isArray(o)) {
    o.forEach(it => delete_id(it))
  } else {
    delete_id(o)
  }
  return o;
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
