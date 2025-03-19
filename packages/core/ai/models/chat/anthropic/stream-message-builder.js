/**
 * @import { claude_completion_response, stream_event, text_content, tool_use_content
 * } from "./types.private.js";
 */


/**
 * @description Given a stream of anthropic events, construct a complete message response
 */
export const stream_message_builder = () => {
  /** @type {claude_completion_response} */
  let final;

  return {
    /** @param {stream_event} delta */
    add_delta: (delta) => {
      if(delta.type==='message_start') {
        final = {...delta.message};
      } else if(delta.type==='message_delta') {
        final = {...final, ...delta.delta};
      } else if(delta.type==='error') {
        console.log('Anthropic::add_delta ', delta);
        throw delta.error;
      } else if(delta.type==='content_block_start') {
        final.content[delta.index] = delta.content_block;
      } else if(delta.type==='content_block_delta') {
        if(delta.delta.type==='text_delta') {
          const c = (/** @type {text_content} */ (final.content[delta.index]));
          final.content[delta.index] = {
            ...c,
            text: c.text + delta.delta.text
          } ;
        } else if(delta.delta.type==='input_json_delta') {
          const c = (/** @type {tool_use_content} */ (final.content[delta.index]));
          final.content[delta.index] = {
            ...c,
            __partial_json: (c.__partial_json ?? '') + delta.delta.partial_json,
          } ;
        }
      } else if(delta.type==='content_block_stop') {
        const c = final.content[delta.index];
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
