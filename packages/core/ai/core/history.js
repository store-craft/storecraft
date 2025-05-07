/**
 * @import { 
 *  HistoryProvider, History, ChatHistoryType
 * } from './types.private.js'
 */
import { App } from '../../index.js';
import { reduce_text_deltas_into_text } from './content-utils.js';

/**
 * @implements {HistoryProvider}
 */
export class StorageHistoryProvider {

  /** @type {Record<string, any>} */
  #cache = {};

  constructor() {
  }

  /**
   * @description Load the chat messages from cache or storage
   * @param {string} threadId 
   * @param {App} app 
   * @returns {Promise<ChatHistoryType>}
   */
  #load_chat = async (threadId, app) => {
    try {
      const key = this.#to_key(threadId);
      if(this.#cache[key])
        return this.#cache[key];
  
      const stream = await app.storage.getStream(
        key
      );
  
      if(!stream.value) {
        return {
          messages: [],
          thread_id: threadId,
          metadata: {
          }
        };
      }

      let text = '';
      const decoder = new TextDecoder();
      for await (const part of stream.value) {
        text += decoder.decode(part);
      }
   
      return JSON.parse(text);

    } catch(e) {
      console.error('load chat error', e)
      return {
        messages: [],
        metadata: {
          thread_id: threadId,
          created_at: new Date().toISOString(),
        }
      };
    }
  }

  /** @param {string} threadId */
  #to_key = (threadId) => `chats/${threadId}.json`;

  /** @type {HistoryProvider["load"]} */
  load = async (threadId, app) => {

    const key = this.#to_key(threadId);
    const chat = await this.#load_chat(threadId, app);

    /** @type {History} */
    const history = {

      threadId,

      add: (...messages_delta) => {
        chat.messages.push(...messages_delta);

        return history;
      },

      commit: async (metadata) => {
        if(metadata) {
          chat.metadata = {
            ...chat.metadata,
            ...metadata
          }
        }

        // reduce text deltas into text
        chat.messages = chat.messages.map(
          m => ({
            ...m,
            contents: reduce_text_deltas_into_text(m.contents)
          })
        );

        this.#cache[key] = chat;

        await app.storage.putArraybuffer(
          key,
          /** @type {ArrayBuffer} */
          ((new TextEncoder()).encode(
            JSON.stringify(chat)
          ).buffer),
          undefined 
          // we will not save the metadata here, 
          // it might hold sensitive data
          // and we don't want to save it in the storage.
          // we will save it in the database
          // chat.metadata
        );
        
        return history;
      },

      toArray: () => [...chat.messages],

      metadata: () => ({
        ...chat.metadata
      })

    }

    return history;
  }

}
