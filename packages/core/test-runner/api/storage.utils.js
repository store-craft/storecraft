
export const string_to_readable_stream = (str='') => {
  return to_readable_stream(
    new TextEncoder().encode(str)
  );
}

/**
 */
export const to_readable_stream = (any) => {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(any);
      controller.close();
    }
  });
}

/**
 * @param {ReadableStream} stream 
 * @returns {Promise<ArrayBuffer>}
 */
export const readable_stream_to_array_buffer = async (stream) => {

  const arr = [];
  for await (const chunk of stream) {
    if (chunk instanceof ArrayBuffer) {
      arr.push(...new Uint8Array(chunk));
    } else if (chunk instanceof Uint8Array) {
      arr.push(...chunk);
    } else if (chunk instanceof Blob) {
      arr.push(...new Uint8Array(await chunk.arrayBuffer()));
    } else {
      throw new Error('Unsupported type in stream');
    }
  }
  return new Uint8Array(arr).buffer;
}

/**
 * @param {ReadableStream} stream 
 */
export const readable_stream_to_blob = async (stream) => {
  return new Blob([await readable_stream_to_array_buffer(stream)]);
}

/**
 * @param {ReadableStream} stream 
 */
export const readable_stream_to_buffer = async (stream) => {
  return Buffer.from(
    await readable_stream_to_array_buffer(stream)
  );
}

/**
 * @param {ReadableStream} stream 
 */
export const readable_stream_to_string = async (stream) => {
  return new TextDecoder().decode(
    await readable_stream_to_array_buffer(stream)
  );
}


/**
 * @param {ArrayBufferLike} buffer1 
 * @param {ArrayBufferLike} buffer2 
 */
export const areArrayBuffersEqual = async (buffer1, buffer2) => {
  const array1 = new Uint8Array(buffer1);
  const array2 = new Uint8Array(buffer2);

  if (array1.length !== array2.length) return false;

  for (let i = 0; i < array1.length; i++) {
    if (array1[i] !== array2[i]) return false;
  }

  return true;
};


/**
 * @param {Blob} blob1 
 * @param {Blob} blob2 
 */
export const areBlobsEqual = async (blob1, blob2) => {
  return areArrayBuffersEqual(
    await blob1.arrayBuffer(),
    await blob2.arrayBuffer()
  );
};



/**
 * @param {ReadableStream} stream1 
 * @param {ReadableStream} stream2 
 */
export const areReadableStreamsEqual = async (stream1, stream2) => {
  const buffer1 = await readable_stream_to_array_buffer(stream1);
  const buffer2 = await readable_stream_to_array_buffer(stream2);

  return areArrayBuffersEqual(buffer1, buffer2);
};

