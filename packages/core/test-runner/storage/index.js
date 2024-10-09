import 'dotenv/config';
import { suite, test } from 'uvu';
import * as assert from 'uvu/assert';
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os'
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Readable, Stream } from 'node:stream';
import { createReadStream, read } from 'node:fs';
import { file_name } from '../api/api.utils.crud.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const data_with_buffers = [
  {
    key: 'folder1/node.png',
    buffer: await readFile(path.join(__dirname, 'node.png'))
  }
];

/**
 * 
 * @param {ReadableStream} stream 
 */
const readableStreamToArrayBuffer = async (stream) => {
  const arr = [];

  const reader = stream.getReader();
  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      // Do something with last chunk of data then exit reader
      break;
    }

    arr.push(...value)
  }

  return new Uint8Array(arr);
}

/**
 * 
 * @param {ReadableStream} lhs 
 * @param {ReadableStream} rhs 
 */
const areStreamsEqual = async (lhs, rhs) => {
  return areArrayBuffersEqual(
    await readableStreamToArrayBuffer(lhs), 
    await readableStreamToArrayBuffer(rhs)
  );
}
/**
 * 
 * @param {Blob} lhs 
 * @param {Blob} rhs 
 */
const areBlobsEqual = async (lhs, rhs) => {
  return areArrayBuffersEqual(
    await lhs.arrayBuffer(), await rhs.arrayBuffer()
  );
};
/**
 * 
 * @param {ArrayBuffer} lhs 
 * @param {ArrayBuffer} rhs
 */
const areArrayBuffersEqual = (lhs, rhs) => {
  return Buffer.from(lhs).compare(Buffer.from(rhs))==0;
};


/**
 * 
 * @param {import('../../storage/types.storage.js').storage_driver} storage 
 * @param {string} [name]
 */
export const create = (storage, name) => {
  const s = suite(
    name ?? file_name(import.meta.url), 
  );
  
  
  s('BLOB put/get/delete', async () => {

    const data = data_with_buffers.map(
      d => ({
        ...d,
        blob: new Blob([d.buffer]),
        key: 'folder1/node_blob.png'
      })
    );
  
    for (const d of data) {
      await storage.putBlob(d.key, d.blob);
      // read
      const { value: blob_read } = await storage.getBlob(d.key);
      // compare
      const equal = await areBlobsEqual(blob_read, d.blob);
      assert.ok(equal, 'Blobs are not equal !!!');
  
      await storage.remove(d.key);
      const removed = await storage.getBlob(d.key);
      assert.ok(removed.value===undefined, 'Blobwas not deleted !!!');
    }
    
  });
  
  s('ArrayBuffer put/get/delete', async () => {
  
    const data = data_with_buffers;
  
    for (const d of data) {
      await storage.putArraybuffer(d.key, d.buffer);
      // read
      const { value } = await storage.getArraybuffer(d.key);
      // compare
      const equal = areArrayBuffersEqual(d.buffer, value);
      assert.ok(equal, 'are not equal !!!');
  
      await storage.remove(d.key);
      const removed = await storage.getArraybuffer(d.key);
      assert.ok(removed.value===undefined, 'Blobwas not deleted !!!');
    }
    
  });
  
  s('Stream put/get/delete', async () => {
  
    const data = data_with_buffers.map(
      d => ({
        ...d,
        stream: Readable.toWeb(Readable.from(d.buffer)),
        // stream: Readable.toWeb(createReadStream('node.png')),
        key: 'folder1/stream_node.png'
      })
    );
  
    for (const d of data) {
      await storage.putStream(d.key, d.stream);
      // read
      const { value } = await storage.getStream(d.key);
  // //
  //     const reader = value.getReader();
  
  //     while(true) {
  //       const {done, value: value2 } = await reader.read();
  //       if(done)
  //         break;
  //       console.log('CHUNK: ', value2);
  //     }
  //     console.log(d.buffer)
  
  
  //     return;
      // compare
  
      const equal = areArrayBuffersEqual(d.buffer, await readableStreamToArrayBuffer(value));
      assert.ok(equal, 'are not equal !!!');
  
      const removed = await storage.remove(d.key);
      assert.ok(removed, 'not removed !!!');
    }
    
  });
  
  return s;
}

