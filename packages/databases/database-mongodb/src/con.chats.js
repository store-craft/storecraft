/**
 * @import { db_chats as db_col } from '@storecraft/core/database'
 * @import { WithRelations } from './utils.types.js'
 */
import { Collection } from 'mongodb'
import { MongoDB } from '../index.js'
import { count_regular, get_regular, list_regular } from './con.shared.js'
import { handle_or_id, to_objid } from './utils.funcs.js';
import { 
  add_search_terms_relation_on, delete_me, 
  save_me, 
} from './utils.relations.js';

/**
 * @param {MongoDB} d 
 * @returns {Collection<WithRelations<db_col["$type_get"]>>}
 */
const col = (d) => d.collection('chats');

/**
 * @param {MongoDB} driver 
 * @returns {db_col["upsert"]}
 */
const upsert = (driver) => {
  return async (data, search_terms=[]) => {
    data = {...data};
    const objid = to_objid(data.id);
    const session = driver.mongo_client.startSession();

    try {
      await session.withTransaction(
        async () => {

          // SEARCH
          add_search_terms_relation_on(data, search_terms);

          // SAVE ME
          await save_me(driver, 'chats', objid, data, session);

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
 * @param {MongoDB} driver 
 */
const get = (driver) => get_regular(driver, col(driver));

/**
 * @param {MongoDB} driver 
 * @returns {db_col["remove"]}
 */
const remove = (driver) => {
  return async (id_or_handle) => {
    const item = await col(driver).findOne(handle_or_id(id_or_handle));

    if(!item) return;

    const objid = to_objid(item.id)
    const session = driver.mongo_client.startSession();

    try {
      await session.withTransaction(
        async () => {

          // DELETE ME
          await delete_me(
            driver, 'chats', objid, session
          );

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
 * @param {MongoDB} driver 
 */
const list = (driver) => list_regular(driver, col(driver));

/**
 * @param {MongoDB} driver 
 */
const count = (driver) => count_regular(driver, col(driver));

/** 
 * @param {MongoDB} driver
 * @return {db_col & { _col: ReturnType<col>}}
 */
export const impl = (driver) => {

  return {
    _col: col(driver),
    get: get(driver),
    upsert: upsert(driver),
    remove: remove(driver),
    list: list(driver),
    count: count(driver),
  }
}
