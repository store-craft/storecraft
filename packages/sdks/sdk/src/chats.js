/**
 * @import { ChatTypeUpsert, ChatType, ChatHistoryType } from '@storecraft/core/api'
 * @import { StorageSignedOperation } from '@storecraft/core/storage'
 */
import { StorecraftSDK } from '../index.js'
import { collection_base, fetchApiWithAuth } from './utils.api.fetch.js';

/**
 * @description Base `chats` metadata **CRUD**
 * @extends {collection_base<ChatTypeUpsert, ChatType>}
 */
export default class Chats extends collection_base {

  /**
   * @param {StorecraftSDK} sdk 
   */
  constructor(sdk) {
    super(sdk, 'chats');
  }

  /**
   * @description Download chat contents and metadata.
   * @template {true | false} [PRESIGNED=false]
   * @param {string} thread_id the chat thread id 
   * @param {PRESIGNED} [prefers_presigned_urls=false] Do you 
   * prefer presigned urls?
   * @returns {Promise<
   *  PRESIGNED extends false ? 
   *    ChatHistoryType : 
   *    StorageSignedOperation
   * >}
   */
  download = async (
    thread_id, 
    prefers_presigned_urls=/** @type {PRESIGNED} */(false)
  ) => {

    const result = await fetchApiWithAuth(
      this.sdk,
      `chats/download/${thread_id}?signed=${prefers_presigned_urls}`,
      {
        method: 'get',
      }
    );

    return result
  }
  

}