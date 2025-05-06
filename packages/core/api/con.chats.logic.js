/**
 * @import { ApiQuery, ChatTypeUpsert, ChatType } from './types.public.js'
 */
import { App } from "../index.js";
import { union } from './utils.func.js';
import { chatTypeUpsertSchema } from './types.autogen.zod.api.js'
import { 
  regular_get, regular_list, 
  regular_remove, regular_upsert 
} from './con.shared.js'

/** @param {App} app */
export const db = app => app.db.resources.chats;

/**
 * @param {App} app
 */
export const upsert = (app) => 
/**
 * @description `upsert` a `chat` metadata
 * @param {ChatTypeUpsert} item
 */
(item) => regular_upsert(
  app, db(app), 'chat', chatTypeUpsertSchema, 
  (before) => before,
  (final) => {
    
    return union(
      final?.customer_id,
      final?.customer_email,
      final?.customer_id && `customer:${final?.customer_id}`,
      final?.customer_email && `email:${final?.customer_email}`,
    );
  },
  'chats/upsert'
)(item);

/**
 * @param {App} app
 */
export const count = (app) => 
  /**
   * @description Count query results
   * @param {ApiQuery<ChatType>} query 
   */
  (query) => {
    return db(app).count(query);
  }


/**
 * @param {App} app
 */  
export const inter = app => {

  return {
    get: regular_get(app, db(app), 'chats/get'),
    upsert: upsert(app),
    remove: regular_remove(app, db(app), 'chats/remove'),
    list: regular_list(app, db(app), 'chats/list'),
    count: count(app)
  }
}
