/**
 * @import { AI, chat_completion_chunk_result, chat_completion_result } from "./types.llm.completion.d.ts";
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

      // for await(const chunk of result.body) {
      //   console.log(new TextDecoder().decode(chunk), '\n\n\n')
      // }

      /** @type {chat_completion_result & chat_completion_chunk_result} */
      const json = await result.json();

      return json;

    } catch (e) {
      console.log('OpenAI', e)
    } finally {

    }

    return undefined;
  }
}