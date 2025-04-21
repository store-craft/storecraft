

/**
 * Converts a ReadableStream to a string
 * @param {ReadableStream} stream 
 * @returns {Promise<string>}
 */
export const readable_stream_to_string = async (stream) => {

  const decoder = new TextDecoder('utf-8');
  let result = undefined;
  for await (const chunk of stream) {
    const decoded_chunk = decoder.decode(chunk, { stream: true });
    if(!result)
      result = decoded_chunk;
    else
      result += decoded_chunk;
  }
  return result;
}