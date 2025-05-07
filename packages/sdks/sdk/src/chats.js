/**
 * @import { ChatTypeUpsert, ChatType } from '@storecraft/core/api'
 */
import { StorecraftSDK } from '../index.js'
import { collection_base } from './utils.api.fetch.js';

/**
 * @description Base `chats` metadata **CRUD**
 * 
 * @extends {collection_base<ChatTypeUpsert, ChatType>}
 */
export default class Posts extends collection_base {

  /**
   * @param {StorecraftSDK} sdk 
   */
  constructor(sdk) {
    super(sdk, 'chats');
  }

}