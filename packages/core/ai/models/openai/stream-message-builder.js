/**
 * @import { chat_completion_chunk_result, chat_completion_result, 
 * } from "./types.js";
 */


/**
 * @description Given a stream of openai chat completion chunks, 
 * construct a complete message response
 * 
 */
export const stream_message_builder = () => {
  /** @type {chat_completion_result} */
  let final;

  return {
    /** @param {chat_completion_chunk_result} delta */
    add_delta: (delta) => {
      if(!Boolean(delta))
        return;

      if(!Boolean(final)) {
        final = {
          created: delta.created,
          id: delta.id,
          model: delta.model,
          system_fingerprint: delta.system_fingerprint,
          object: 'chat.completion',
          usage: delta.usage,
          choices: [
            {
              finish_reason: delta.choices[0].finish_reason,
              index: delta.choices[0].index,
              logprobs: delta.choices[0].logprobs,
              message: delta.choices[0].delta
            }
          ], 
        };

        return;
      }

      const d_choice = delta.choices?.[0];

      if(d_choice?.finish_reason)
        final.choices[0].finish_reason = d_choice.finish_reason;

      if(d_choice?.delta?.content) {
        final.choices[0].message.content = (final.choices[0].message.content ?? '') + 
        d_choice.delta.content;
      }
      
      if(d_choice?.delta?.refusal)
        final.choices[0].message.refusal = d_choice.delta.refusal;

      if(d_choice?.delta?.tool_calls) {
        if(!final.choices[0].message.tool_calls) {
          final.choices[0].message.tool_calls = d_choice.delta.tool_calls;
        } else {
          final.choices[0].message.tool_calls.forEach(
            (tc, ix) => {
              tc.function.arguments += d_choice.delta.tool_calls[ix].function.arguments;
            }
          );
        }
      }

    },
    done: () => final
  }
}
