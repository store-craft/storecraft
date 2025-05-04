/**
 * @import { content, GenerateTextResponse } from './types.private.d.ts'
 */

/**
 * @description Given a stream of {@link content}, 
 * accumulate it for the purpose of `non-streamable` response.
 * @param {ReadableStream<content>} stream
 */
export const stream_accumulate = async (stream) => {
  /** @type {content[]} */
  const contents = []

  /** @type {content[]} */
  const text_deltas = [];

  for await(const update of stream) {
    if(update.type==='delta_text')
      text_deltas.push(update);
    else
      contents.push(update);
  }

  // reduce text deltas
  if(text_deltas.length) {
    const reduced_text_content = text_deltas.reduce(
      (p, update) => {
        if(update.type==='delta_text')
          p.content += update.content;
  
        return p;
      }, {
        content: '',
        type: 'text'
      }
    );
  
    contents.push(reduced_text_content);
  }

  return contents;
}

