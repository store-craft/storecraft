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
   * @description Load the chat messages from 
   * cache or storage
   * @param {string} threadId 
   * @param {App} app 
   * @returns {Promise<ChatHistoryType>}
   */
  #load_chat = async (threadId, app) => {
    const new_chat = {
      messages: [],
      metadata: {
        thread_id: threadId,
        created_at: new Date().toISOString(),
      }
    }

    try {
      // const key = this.#to_key(threadId);
      if(this.#cache[threadId])
        return this.#cache[threadId];

      const get = await app.api.chats.download(
        threadId, false
      );
  
      if(!get.stream.value) 
        return new_chat;

      let text = '';
      const decoder = new TextDecoder();
      for await (const part of get.stream.value) {
        text += decoder.decode(part);
      }
   
      return JSON.parse(text);

    } catch(e) {
      console.error('load chat error', e)
      return new_chat;
    }
  }

  /** @type {HistoryProvider["load"]} */
  load = async (threadId, app) => {

    // const key = this.#to_key(threadId);
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
          (m) => ({
            ...m,
            contents: reduce_text_deltas_into_text(m.contents)
          })
        );

        this.#cache[threadId] = chat;

        await app.api.chats.upload(
          threadId,
          chat
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
