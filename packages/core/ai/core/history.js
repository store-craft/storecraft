/**
 * 
 * @import { LLMHistoryProvider, LLMHistory } from './types.private.js'
 */

import { App } from '../../index.js';


/**
 * @template {any} [LLMMessageType=any]
 * 
 * @implements {LLMHistoryProvider}
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
   * @returns {Promise<LLMMessageType[]>}
   */
  #load_chat = async (threadId, app) => {
    try {
      const key = this.#to_key(threadId);
      if(this.#cache[key])
        return this.#cache[key];
  
      const stream = await app.storage.getStream(
        key
      );
  
      if(!stream.value)
          return [];

      let text = '';
      for await (const part of stream.value) {
        text += part;
      }
  
      return JSON.parse(text);

    } catch(e) {
      return [];
    }
  }


  /** @param {string} threadId */
  #to_key = (threadId) => `chats/${threadId}.json`;

  /** @type {LLMHistoryProvider["load"]} */
  load = async (threadId, app) => {

    const key = this.#to_key(threadId);

    const messages = await this.#load_chat(threadId, app);

    /** @type {LLMHistory<LLMMessageType>} */
    const history = {

      threadId,

      add: (...messages_delta) => {
        messages.push(...messages_delta);

        return history;
      },

      commit: async () => {
        this.#cache[key] = messages;

        await app.storage.putArraybuffer(
          key,
          /** @type {ArrayBuffer} */
          ((new TextEncoder()).encode(
            JSON.stringify(messages)
          ).buffer)
        );
        
        return history;
      },

      toArray: () => [...messages]

    }

    return history;
  }

}