import { isDef, isUndef, to_objid } from './utils.funcs.js';
import { MongoDB } from '../driver.js';
import { ObjectId } from 'bson';

/**
 * @template {any} T
 * @typedef {Object} Relation
 * @property {ObjectId[]} [ids]
 * @property {Record<import('@storecraft/core/v-database').ID, T>} [entries]
 */

/**
 * @template {any} T
 * @typedef {T & { _relations? : Record<string, Relation<any>> }} WithRelations
 */

/**
 * 
 * On upsert Create a relation on a given field that represents a relation.
 * for example, each product specifies collections it belongs to.
 * Basically creates an ids array and embedded documents for fast retrival.
 * @template {import('@storecraft/core/v-api').BaseType} T
 * @param {MongoDB} driver our driver
 * @param {T} data data to create the connection from
 * @param {string} fieldName the field name, that represents a relation, a field with { id } property
 * @param {string} belongsToCollection which collection does the field relate to
 * @param {boolean} [reload=false] re-retrive documents ?
 * @returns {Promise<WithRelations<T>>}
 */
export const create_explicit_relation = async (
  driver, data, fieldName, belongsToCollection, reload=false) => {

  const value = data?.[fieldName];
  if(isUndef(value))
    return data;
   
  /** @type {import('@storecraft/core/v-api').BaseType[]} */
  const items = Array.isArray(value) ? value : [value];

  /** @type {WithRelations<any>} */
  let data_with_rel = { ...data }
  data_with_rel._relations = data_with_rel._relations ?? {};
  /** @type {Relation<any>} */
  const relation = data_with_rel._relations[belongsToCollection] = {};
  relation.ids = items.filter(i => isDef(i?.id)).map(c => to_objid(c.id));
  relation.entries = {};

  if(reload) {
    const entries = await driver.collection(belongsToCollection).find(
      { _id: { $in : relation.ids }}
    ).toArray();
    entries.forEach(
      e => {
        relation.entries[e._id.toString()] = e;
      }
    );
  } else {
    relation.entries = Object.fromEntries(
      items.map(it => [it.id.split('_').at(-1), it])
    );
  }

  // delete fieldname
  delete data_with_rel[fieldName];
  return data_with_rel;
}
