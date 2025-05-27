/**
 * @import { chat_completion_chunk_result, chat_completion_result, 
 * } from "./types.private.js";
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
    /** @param {chat_completion_chunk_result} chunk */
    add_chunk: (chunk) => {
      if(!Boolean(chunk))
        return;

      if(!Boolean(final)) {
        final = {
          created: chunk.created,
          id: chunk.id,
          model: chunk.model,
          system_fingerprint: chunk.system_fingerprint,
          object: 'chat.completion',
          usage: chunk.usage,
          choices: [
          ], 
        };
      }

      // apply higher choises
      chunk.choices?.forEach(
        (choice) => {
          // @ts-ignore
          // initial choice
          final.choices[choice.index] ??= {};

          const target_choice = final.choices[choice.index];

          // always override these
          target_choice.finish_reason = choice.finish_reason;
          target_choice.logprobs = choice.logprobs;
          target_choice.index = choice.index;

          if(choice.delta) {
            // initial message in choice
            if(!target_choice.message) {
              target_choice.message = choice.delta;
              return;
            } else if(choice.delta.content) {
              target_choice.message.content ??= '';
              target_choice.message.content += choice.delta.content;
            }

            if(choice.delta.refusal)
              target_choice.message.refusal = choice.delta.refusal;
  
            const tools_delta = choice.delta.tool_calls;

            if(tools_delta) {
              target_choice.message.tool_calls ??= []; 
              const target_tools = target_choice.message.tool_calls; 
              // console.log('tools_delta', tools_delta);
              tools_delta.forEach(
                (tc, ix) => {
                  // console.log('target_tools[tc.index]', target_tools[tc.index]);
                  if(!target_tools[tc.index]) {
                    target_tools[tc.index] = tc;
                  } else {
                    // console.log('existing tool call', tc);
                    target_tools[tc.index].function.arguments += 
                      tc.function.arguments;
                  }
                }
              )
            }
          }

        }
      );

    },
    done: () => final
  }
}
