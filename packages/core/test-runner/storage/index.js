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

const sleep = (ms=1000) => new Promise(
  (resolve, reject) => {
    setTimeout(resolve, ms);
  }
)

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
  
  
  s('ArrayBuffer put/get', async () => {
  
    const data = data_with_buffers;
  
    for (const d of data) {
      
      await storage.putArraybuffer(d.key, d.buffer);
      // read
      const { value } = await storage.getArraybuffer(d.key);
      // compare
      const equal = areArrayBuffersEqual(d.buffer, value);
      assert.ok(equal, 'are not equal !!!');
  
    }
    
  });
  

  s('BLOB put/get', async () => {

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
    }
  });  

  s('Stream put/get', async () => {
  
    const data = data_with_buffers.map(
      d => ({
        ...d,
        stream: Readable.toWeb(Readable.from(d.buffer)),
        // stream: Readable.toWeb(createReadStream('node.png')),
        key: 'folder1/stream_node.png'
      })
    );
  
    for (const d of data) {
      // @ts-ignore
      await storage.putStream(d.key, d.stream);
      // read
      const { value } = await storage.getStream(d.key);

      // let's read
      const reader = value.getReader();
      let stream_bytes_length = 0;
      while(true) {
        const {done, value: chunk } = await reader.read();
        if(done)
          break;
        stream_bytes_length += chunk.byteLength;
      }

      // console.log(d.buffer.byteLength);
      // console.log(stream_bytes_length);

      assert.ok(
        d.buffer.byteLength==stream_bytes_length, 
        `stream mismatch bytes length, read ${stream_bytes_length} != ${d.buffer.byteLength}`
      );
  
    }
    
  });
  

  s('Remove', async () => {
  
    const key = 'folder-test/about_to_be_removed.png'
    const buffer = data_with_buffers[0].buffer;
    
    await storage.putArraybuffer(key, buffer);
    // await sleep(1000);
    await storage.remove(key);
    // await sleep(1000);
    const removed = await storage.getArraybuffer(key);

    assert.ok(
      (removed.value===undefined) || 
      (removed.value.byteLength==0), 
      'not removed !!!'
    );
  });
  
  
  return s;
}

