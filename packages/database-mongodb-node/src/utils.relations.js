import { ClientSession, ObjectId } from 'mongodb';
import { isDef, isUndef, to_objid } from './utils.funcs.js';
import { MongoDB } from '../driver.js';

/**
 * @template {any} T
 * 
 * 
 * @typedef {Object} Relation
 * @property {ObjectId[]} [ids]
 * @property {Record<
 *  import('@storecraft/core/v-database').ID, T>
 * } [entries]
 */

/**
 * @template {any} T
 * 
 * @typedef {T & { _relations? : Record<string, Relation<any>> }} WithRelations
 */

/**
 * 
 * On upsert Create a relation on a given field that represents a relation.
 * for example, each product specifies collections it belongs to.
 * Basically creates an ids array and embedded documents for fast retrival.
 * 
 * 
 * @template {import('@storecraft/core/v-api').BaseType} T
 * 
 * 
 * @param {MongoDB} driver our driver
 * @param {T} data data to create the connection from
 * @param {string} fieldName the field name, that represents a relation, a field with { id } property
 * @param {string} belongsToCollection which collection does the field relate to
 * @param {boolean} [reload=false] re-retrive documents ?
 * 
 * 
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
  const relation = data_with_rel._relations[fieldName] = {};

  relation.ids = items.filter(i => isDef(i?.id)).map(c => to_objid(c.id));
  relation.entries = {};

  if(reload) {
    const entries = await driver.collection(belongsToCollection).find(
      { 
        _id: { 
          $in : relation.ids 
        }
      }
    ).toArray();

    // console.log('belongsToCollection', belongsToCollection)
    // console.log('entries', entries)

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

/**
 * Create a `search` relation on the document (embed it)
 * 
 * @template {Object.<string, any>} T
 * 
 * @param {T} data 
 * @param {string[]} terms 
 * 
 */
export const add_search_terms_relation_on = (data, terms=[]) => {
  if(!data)
    return;

  if(!Array.isArray(terms))
    throw new Error('terms is not an array !');

  data._relations = data._relations ?? {};
  data._relations.search = terms;

  return data;
}


/**
 * 
 * Update an `entry` on all of it's connections in the `relation`.
 * Suppose, we have a many-to-x relation, then we update `x` on
 * all of these many connections at once.
 * 
 * 
 * @param {MongoDB} driver mongodb driver instance
 * @param {string} collection the collection from which the `relation` is from
 * @param {string} relation_name the `relation` name
 * @param {ObjectId} entry_objid the proper `ObjectId` of the entry
 * @param {object} entry the entry data
 * @param {ClientSession} [session] client `session` for atomicity purposes
 * @param {string[]} [search_terms_to_add=[]] Extra `search` terms to add
 * to all the affected connections
 * 
 */
export const update_entry_on_all_connection_of_relation = (
  driver, collection, relation_name, entry_objid, entry, session,
  search_terms_to_add=[]
) => {

  return driver.collection(collection).updateMany(
    { 
      [`_relations.${relation_name}.ids`] : entry_objid 
    },
    { 
      $set: { 
        [`_relations.${relation_name}.entries.${entry_objid.toString()}`]: entry 
      },
      $addToSet: { 
        '_relations.search': { $each : search_terms_to_add} 
      },
    },
    { 
      session,
      upsert: false
    }
  );

}


/**
 * 
 * Update / Create an `entry` on a specific connection, that is 
 * found by `mongodb` filter in the `relation`.
 * Suppose, we have a many-to-x relation, then we create a new
 * connection a-to-x
 * 
 * 
 * @param {MongoDB} driver mongodb driver instance
 * @param {string} collection the collection from which the `relation` is from
 * @param {string} relation_name the `relation` name
 * @param {import('mongodb').Filter<any>} from_object_filter the proper `ObjectId` of the from connection
 * @param {ObjectId} entry_objid the proper `ObjectId` of the entry
 * @param {object} entry the entry data
 * @param {ClientSession} [session] client `session` for atomicity purposes
 * @param {string[]} [search_terms_to_add=[]] Extra `search` terms to add
 * to the affected connection
 * 
 */
export const update_specific_connection_of_relation_with_filter = (
  driver, collection, relation_name, from_object_filter, 
  entry_objid, entry, session, search_terms_to_add=[]
) => {

  return driver.collection(collection).updateOne(
    from_object_filter,
    { 
      $set: { 
        [`_relations.${relation_name}.entries.${entry_objid.toString()}`]: entry 
      },
      $addToSet: { 
        [`_relations.${relation_name}.ids`]: entry_objid,
        '_relations.search': { $each : search_terms_to_add} 
      },
    },
    { 
      session,
      upsert: false
    }
  );

}

/**
 * 
 * Update / Create an `entry` on a specific connection in the `relation`.
 * Suppose, we have a many-to-x relation, then we create a new
 * connection a-to-x
 * 
 * 
 * @param {MongoDB} driver mongodb driver instance
 * @param {string} collection the collection from which the `relation` is from
 * @param {string} relation_name the `relation` name
 * @param {ObjectId} from_objid the proper `ObjectId` of the from connection
 * @param {ObjectId} entry_objid the proper `ObjectId` of the entry
 * @param {object} entry the entry data
 * @param {ClientSession} [session] client `session` for atomicity purposes
 * @param {string[]} [search_terms_to_add=[]] Extra `search` terms to add
 * to the affected connection
 * 
 */
export const update_specific_connection_of_relation = (
  driver, collection, relation_name, from_objid, entry_objid, 
  entry, session, search_terms_to_add=[]
) => {

  return update_specific_connection_of_relation_with_filter(
    driver, collection, relation_name, 
    {
      _id: from_objid
    },
    entry_objid, entry, session, 
    search_terms_to_add
  );

}


/**
 * 
 * Remove an `entry` from all of it's connections in the `relation`.
 * Suppose, we have a many-to-x relation, then we remove `x` from
 * all these many connections at once.
 * 
 * 
 * @param {MongoDB} driver mongodb driver instance
 * @param {string} collection the collection from which the `relation` is from
 * @param {string} relation_name the `relation` name
 * @param {ObjectId} entry_objid the proper `ObjectId` of the entry
 * @param {ClientSession} [session] client `session` for atomicity purposes
 * @param {string[]} [search_terms_to_remove=[]] Extra `search` terms to remove
 * from all the connections
 * 
 */
export const remove_entry_from_all_connection_of_relation = (
  driver, collection, relation_name, entry_objid, session,
  search_terms_to_remove=[]
) => {
  return driver.collection(collection).updateMany(
    { 
      [`_relations.${relation_name}.ids`] : entry_objid 
    },
    { 
      $pull: {
        [`_relations.${relation_name}.ids`] : entry_objid,
        '_relations.search': { $in : search_terms_to_remove }
      },
      $unset: { 
        [`_relations.${relation_name}.entries.${entry_objid.toString()}`]: '' 
      },
    },
    { 
      session,
      upsert: false
    }
  );
}


/**
 * 
 * Remove an `entry` from a specific connection in the `relation`.
 * Suppose, we have a a-to-x relation, then we remove `x` from
 * `a` connection.
 * 
 * 
 * @param {MongoDB} driver mongodb driver instance
 * @param {string} collection the collection from which the `relation` is from
 * @param {string} relation_name the `relation` name
 * @param {ObjectId} from_objid the proper `ObjectId` of the from connection
 * @param {ObjectId} entry_objid the proper `ObjectId` of the entry
 * @param {ClientSession} [session] client `session` for atomicity purposes
 * @param {string[]} [search_terms_to_remove=[]] Extra `search` terms to remove
 * from the affected connection
 * 
 */
export const remove_specific_connection_of_relation = (
  driver, collection, relation_name, from_objid, entry_objid, session,
  search_terms_to_remove=[]
) => {

  return remove_specific_connection_of_relation_with_filter(
    driver, collection, relation_name, 
    {
      _id: from_objid
    }, 
    entry_objid, session,
    search_terms_to_remove
  );
}


/**
 * 
 * Remove an `entry` from a specific connection in the `relation`.
 * Suppose, we have a a-to-x relation, then we remove `x` from
 * `a` connection. 
 * 
 * We locate `a` by a `mongodb` filter
 * 
 * 
 * @param {MongoDB} driver mongodb driver instance
 * @param {string} collection the collection from which the `relation` is from
 * @param {string} relation_name the `relation` name
 * @param {import('mongodb').Filter<any>} from_object_filter 
 * `mongodb` Filter to locate the first document, the from part of the connection
 * @param {ObjectId} entry_objid the proper `ObjectId` of the entry
 * @param {ClientSession} [session] client `session` for atomicity purposes
 * @param {string[]} [search_terms_to_remove=[]] Extra `search` terms to remove
 * from the affected connection
 * 
 */
export const remove_specific_connection_of_relation_with_filter = (
  driver, collection, relation_name, from_object_filter, entry_objid, session,
  search_terms_to_remove
) => {

  return driver.collection(collection).updateOne(
    from_object_filter,
    { 
      $pull: {
        [`_relations.${relation_name}.ids`] : entry_objid,
        '_relations.search': { $in : search_terms_to_remove }
      },
      $unset: { 
        [`_relations.${relation_name}.entries.${entry_objid.toString()}`]: '' 
      },
    },
    { 
      session, upsert: false 
    }
  );
  
}


/**
 * 
 * A simple `save` (using **Mongo** `replaceOne`)
 * 
 * 
 * @param {MongoDB} driver `mongodb` driver
 * @param {string} collection the `collection` to save into
 * @param {ObjectId} object_id the `object id` of the item
 * @param {object} document the document data
 * @param {ClientSession} [session] client `session` for atomicity purposes
 * 
 */
export const save_me = (driver, collection, object_id, document, session) => {
  return driver.collection(collection).replaceOne(
    { 
      _id: object_id 
    }, 
    document, 
    { 
      session, 
      upsert: true 
    }
  );

}


/**
 * 
 * A simple `delete` (using **Mongo** `deleteOne`) with `session` transaction
 * 
 * 
 * @param {MongoDB} driver `mongodb` driver
 * @param {string} collection the `collection` to save into
 * @param {ObjectId} object_id the `object id` of the item
 * @param {ClientSession} [session] client `session` for atomicity purposes
 * 
 */
export const delete_me = (driver, collection, object_id, session) => {
  return driver.collection(collection).deleteOne(
    { 
      _id: object_id 
    }, 
    { 
      session, 
    }
  );
}
