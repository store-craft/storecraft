/**
 * @import { content, GenerateTextResponse } from './types.private.d.ts'
 */

/**
 * @description Given a stream of {@link content}, 
 * consume it and reduce text deltas.
 * @param {ReadableStream<content>} stream
 */
export const content_stream_accumulate = async (stream) => {
  /** @type {content[]} */
  const contents = []

  for await(const update of stream) {
    contents.push(update);
  }

  return reduce_text_deltas_into_text(contents);
}



/**
 * @description Given an array of {@link content}, 
 * convert running text deltas into a single text content.
 * @param {content[]} contents
 */
export const reduce_text_deltas_into_text = (contents) => {
  /** @type {content[]} */
  const reduced = [];

  for (let ix = 0; ix < contents.length; ix++) {
    const content = contents[ix];

    if(content.type!=='delta_text') {
      reduced.push(content);
      continue;
    }

    // delta_text. We will look ahead for the next delta_text
    // and merge them into a single text content
    let text = content.content;
    ix = ix + 1;
    while(ix < contents.length) {
      const next_content = contents[ix];

      if(next_content.type!=='delta_text') {
        // we need to decrement the index to
        // decompansate the for having looked ahead
        ix-=1; 
        break;
      }

      text += next_content.content;
      ix++;
    }

    reduced.push({
      type: 'text',
      content: text
    });
    
  }

  return reduced;
}

