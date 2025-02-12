/**
 * @import { 
assistant_message,
 *  chat_completion_input, chat_completion_result, 
 *  chat_message, config 
 * } from "./types.js";
 * @import { AI, content } from "../types.js";
 */

/**
 * 
 * @param {assistant_message} m 
 * @returns {content[]}
 */
export const assistant_message_to_content = (m) => {
  if(typeof m.content === 'string') {
    return [
      {
        content: m.content,
        type: 'text'
      }
    ];
  }

  if(Array.isArray(m.content)) {
    return m.content.map(
      (part) => {
        if('refusal' in part) {
          return {
            content: part.refusal,
            type:'error'
          }
        } else {
          return {
            content: part.text,
            type: 'text'
          }
        }
      }
    )
  }
  
  return undefined;
}