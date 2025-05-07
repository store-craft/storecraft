/**
 * @import { ApiQuery, ChatTypeUpsert, ChatType } from './types.public.js'
 * @import { ChatHistoryType } from '../ai/types.public.js'
 * @import { Get, StorageSignedOperation } from '../storage/types.storage.js'
 */
import { App } from "../index.js";
import { assert, union } from './utils.func.js';
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
  (before) => {
    before.handle = before.id;
    return before;
  },
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
 * @description Download the chat contents. If signed urls are supported,
 * a presigned url will be returned. Otherwise, a stream
 * will be returned.
 * @param {App} app
 */
export const download = (app) => 
  /**
   * @description Count query results
   * @param {string} chat_id the chat thread id
   * @param {boolean} [prefers_presigned_urls=false] if the client prefers
   * presigned urls and the storage driver supports it, a presigned url
   * will be returned. Otherwise, a stream will be returned.
   * @returns {Promise<
   *  { type: 'presigned', presigned?: StorageSignedOperation } | 
   *  { type: 'stream', stream?: Get<ReadableStream<ChatHistoryType>> }
   * >}
   */
  async (chat_id, prefers_presigned_urls=false) => {
    assert(chat_id, 'chat_id is required');

    const features = await app.api.storage.features();
    const file_key = `chats/${chat_id}.json`;

    if(prefers_presigned_urls && features.supports_signed_urls) {
      return {
        type: 'presigned',
        presigned: await app.api.storage.getSigned(file_key)
      }
    } else {
      return {
        type: 'stream',
        stream: (await app.api.storage.getStream(file_key))
      }
    }
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
    count: count(app),
    download: download(app),
  }
}
