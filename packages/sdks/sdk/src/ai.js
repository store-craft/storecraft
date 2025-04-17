/**
 * @import { 
 *  AgentRunParameters, AgentRunResponse 
 * } from '@storecraft/core/ai/agents/types.js'
 * @import {
 *  HEADER_STORECRAFT_THREAD_ID_LITERAL
 * } from '@storecraft/core/rest/con.ai.routes.js'
 * @import { content } from '@storecraft/core/ai/types.public.js'
 */

import { StorecraftSDK } from '../index.js'
import { url } from './utils.api.fetch.js';

const HEADER_STORECRAFT_THREAD_ID = /** @satisfies {HEADER_STORECRAFT_THREAD_ID_LITERAL} */ (
  'X-STORECRAFT-THREAD-ID'
);

/**
 * @description **AI**
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
   * @param {string} agent_handle agent identifier
   * @param {AgentRunParameters} params 
   * @returns {Promise<AgentRunResponse>}
   */
  speak = async (agent_handle, params) => {
    const response = await this.sdk.fetcher(
      url(this.sdk.config, `ai/agents/${agent_handle}/run`),
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
   * @param {string} agent_handle agent identifier
   * @param {AgentRunParameters} params 
   */
  streamSpeak = async (agent_handle, params) => {
    
    const response = await this.sdk.fetcher(
      url(this.sdk.config, `ai/agents/${agent_handle}/stream`),
      {
        method: 'post',
        body: JSON.stringify(params),
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const threadId = response.headers.get(
      HEADER_STORECRAFT_THREAD_ID ?? 'X-Storecraft-Thread-Id'
    );

    if(!threadId) {
      throw new Error(
        `X-Storecraft-Thread-Id is missing, please tell the backend admin to 
        change the cors' Access-Control-Expose-Headers to accept the header`
      )
    }
    
    return {
      threadId,
      generator: () => StreamSpeakGenerator(response.body)
    }
  }

}

const sleep = (ms=100) => {
  return new Promise(
    (resolve, reject) => {
      setTimeout(
        resolve, ms
      )
    }
  )
}

/**
 * @description Server Sent Events async generator
 * @param {ReadableStream} stream web stream
 */
const StreamSpeakGenerator = async function *(stream) {
  for await (const sse of SSEGenerator(stream)) {
    yield ( /** @type {content} */ (JSON.parse(sse.data)));
  }
}

/**
 * @description Server Sent Events async generator
 * @param {ReadableStream} stream web stream
 */
export const SSEGenerator = async function *(stream) {

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
