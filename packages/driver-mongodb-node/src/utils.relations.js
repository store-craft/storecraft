import { ObjectId } from 'mongodb';
import { isDef, isUndef, to_objid } from './utils.funcs.js';
import { Driver } from '../driver.js';

/**
 * @template {import('@storecraft/core').BaseType} T
 * @typedef {Object} Relation
 * @property {ObjectId[]} [ids]
 * @property {Record<import('@storecraft/core').ID, T>} [entries]
 */

/**
 * @template {import('@storecraft/core').BaseType} T
 * @typedef {import('@storecraft/core').BaseType & T & { _relations? : Record<string, Relation<T>> }} WithRelations
 */

/**
 * 
 * On upsert Create a relation on a given field that represents a relation.
 * for example, each product specifies collections it belongs to.
 * Basically creates an ids array and embedded documents for fast retrival.
 * @template {import('@storecraft/core').BaseType} T
 * @param {Driver} driver our driver
 * @param {T} data data to create the connection from
 * @param {string} fieldName the field name, that represents a relation, a field with { id } property
 * @param {string} belongsToCollection which collection does the field relate to
 * @param {boolean} [ignore_entries=false] don't retrive documents
 * @returns {Promise<WithRelations<T>>}
 */
export const create_hidden_relation = async (driver, data, fieldName, belongsToCollection, ignore_entries=false) => {
  const value = data?.[fieldName];
  if(isUndef(value))
    return data;
   
  /** @type {import('@storecraft/core').BaseType[]} */
  const items = Array.isArray(value) ? value : [value];

  /** @type {WithRelations<T>} */
  let data_with_rel = { ...data }
  data_with_rel._relations = data_with_rel._relations ?? {};
  /** @type {Relation<T>} */
  const relation = data_with_rel._relations[belongsToCollection] = {};
  relation.ids = items.filter(i => isDef(i?.id)).map(c => to_objid(c.id));

  if(!ignore_entries) {
    const entries = await driver.collection(belongsToCollection).find(
      { _id: { $in : relation.ids }}
    ).toArray();
    relation.entries = {};
    entries.forEach(
      e => {
        relation.entries[e._id.toString()] = e;
      }
    );
  }

  return data_with_rel;
}
