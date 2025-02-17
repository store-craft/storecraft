/**
 * @import { 
 *  AgentRunParameters, AgentRunResponse 
 * } from '@storecraft/core/ai/agents/types.js'
 * @import { content } from '@storecraft/core/ai/types.public.js'
 */

import { StorecraftSDK } from '../index.js'
import { url } from './utils.api.fetch.js';

/**
 * @description **AI**
 * 
 */
export default class AI {

  /**
   * 
   * @param {StorecraftSDK} sdk 
   */
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * @description Speak with the main `storecraft` agent sync. It is
   * recommended to use the streamed version {@link streamSpeak}
   * @param {AgentRunParameters} params 
   * @returns {Promise<AgentRunResponse>}
   */
  speak = async (params) => {
    const response = await fetch(
      url(this.sdk.config, 'ai/agent/run'),
      {
        method: 'post',
        body: JSON.stringify(params),
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.json();
  }

  /**
   * @description Stream Speak with the main `storecraft` agent via Server-Sent Events
   * @param {AgentRunParameters} params 
   * @returns {AsyncGenerator<content>}
   */
  streamSpeak = async function*(params) {
    const response = await fetch(
      url(this.sdk.config, 'ai/agent/stream'),
      {
        method: 'post',
        body: JSON.stringify(params),
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    for await (const sse of SSEGenerator2(response.body)) {
      yield ( /** @type {content} */ (JSON.parse(sse.data)));
    }
  }

}


/**
 * @description Server Sent Events async generator
 * @param {ReadableStream} stream web stream
 */
export const SSEGenerator2 = async function *(stream) {

  let active_frame = [];
  let residual_line = '';

  const reader = stream.getReader();
  let current = await reader.read();

  while(!current.done) {
    
    let text = (new TextDecoder()).decode(current.value); 
    // console.log('text \n\n', text)
  
    if(residual_line) {
      text = residual_line + text;
      residual_line = '';
    }
  
    const lines = text.split(/\r\n|\n|\r/).map(l => l.trim());
  
    for(const line of lines) {
      if(line==='' && active_frame.length) {
        // console.log('frame \n\n', active_frame)
        // empty line means processing and dispatch
        yield parse_frame(active_frame);
        active_frame = [];
      } else {
        active_frame.push(line);
      }
    }
  
    // if we got here and we have a line, then it
    // was not finished (Otherwise, it would have been parsed and dispatched)
    // I will need to prepend it to the next batch as it is incomplete
    residual_line = active_frame.pop();

    current = await reader.read();
  }

}



/**
 * @typedef {object} SSEFrame Server Sent Events frame
 * @prop {string} [data]
 * @prop {string} [event]
 */

/**
 * 
 * @param {string[]} lines 
 * @returns {SSEFrame}
 */
const parse_frame = (lines) => {
  return Object.fromEntries(
    lines.map(
      (l) => {
        const delimiter = l.indexOf(':');
        return [
          l.slice(0, delimiter).trim(),
          l.slice(delimiter + 1).trim(),
        ]
      }
    )
  );
}
