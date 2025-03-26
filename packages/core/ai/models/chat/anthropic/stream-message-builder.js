/**
 * @import { 
 *  claude_completion_response, stream_event, 
 *  text_content, tool_use_content
 * } from "./types.private.js";
 */


/**
 * @description Given a stream of anthropic events, construct a complete message response
 */
export const stream_message_builder = () => {
  /** @type {claude_completion_response} */
  let final;

  return {
    /** @param {stream_event} chunk */
    add_chunk: (chunk) => {
      if(chunk.type==='message_start') {
        final = {...chunk.message};
      } else if(chunk.type==='message_delta') {
        final = {...final, ...chunk.delta};
      } else if(chunk.type==='error') {
        console.log('Anthropic::add_delta ', chunk);
        throw chunk.error;
      } else if(chunk.type==='content_block_start') {
        final.content[chunk.index] = chunk.content_block;
      } else if(chunk.type==='content_block_delta') {
        if(chunk.delta.type==='text_delta') {
          const c = (/** @type {text_content} */ (final.content[chunk.index]));
          final.content[chunk.index] = {
            ...c,
            text: c.text + chunk.delta.text
          } ;
        } else if(chunk.delta.type==='input_json_delta') {
          const c = (/** @type {tool_use_content} */ (final.content[chunk.index]));
          final.content[chunk.index] = {
            ...c,
            __partial_json: (c.__partial_json ?? '') + chunk.delta.partial_json,
          } ;
        }
      } else if(chunk.type==='content_block_stop') {
        const c = final.content[chunk.index];
        // Parse accumulated JSON string into object to conform with
        // the type
        if(c.type==='tool_use') {
          c.input = JSON.parse(c.__partial_json);
          delete c['__partial_json']
        }

      } else {
        //ignore other events
      }

    },
    done: () => final
  }
}
