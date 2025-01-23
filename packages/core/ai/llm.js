/**
 * @import { AI, chat_completion_result } from "./types.llm.completion.d.ts";
 */


/**
 * @typedef {Object} OpenAIConfig object
 * @prop {string} endpoint
 * @prop {string} api_key
 */

/**
 * @implements {AI<OpenAIConfig>}
 */
export class OpenAI {
  /**
   * @param {OpenAIConfig} config 
   */
  constructor(config) {
    this.config = config
  }

  /**
   * 
   * @type {AI["complete"]} 
   */
  complete = async (input) => {
    try {

      const result = await fetch(
        this.config.endpoint,
        {
          method: 'post',
          body: JSON.stringify(input),
          headers: {
            "Authorization" : `Bearer ${this.config.api_key}`
          }
        }
      );

      /** @type {chat_completion_result} */
      const json = await result.json();

      return json;

    } catch (e) {
      console.log('OpenAI', e)
    } finally {

    }

    return undefined;
  }
}