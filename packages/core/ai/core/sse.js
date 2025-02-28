
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
        const key = l.slice(0, delimiter).trim();
        const value = l.slice(delimiter + 1);

        return [
          key,
          value,
        ]
      }
    ).filter(([key, value]) => Boolean(key))
  );
}

/**
 * @description Server Sent Events async generator
 * @param {ReadableStream} stream web stream
 */
export const SSEGenerator = async function *(stream) {

  let active_frame = [];
  let residual_line = '';

  for await(const chunk of stream) {
    let text = (new TextDecoder()).decode(chunk); 
    console.log('text \n', text)

    if(residual_line) {
      text = residual_line + text;
      residual_line = '';
    }

    const lines = text.split(/\r\n|\n|\r/);//.map(l => l.trim());

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
  }
}