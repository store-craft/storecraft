import 'dotenv/config';
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { GoogleStorage } from '../adapter.js'
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os'
import * as path from 'node:path';
import service_key from './service-key.json' assert { type: 'json' };

const areBlobsEqual = async (blob1, blob2) => {
  return !Buffer.from(await blob1.arrayBuffer()).compare(
    Buffer.from(await blob2.arrayBuffer())
  );
};

const storage = new GoogleStorage(
  process.env.GS_BUCKET, process.env.GS_CLIENT_EMAIL, 
  process.env.GS_PRIVATE_KEY, process.env.GS_PRIVATE_KEY_ID
  );

test.before(async () => await storage.init())

test('blob put/get/delete', async () => {
  const data = [
    // {
    //   key: 'folder1/tomer.txt',
    //   blob: new Blob(['this is some text from tomer :)']),
    // },
    {
      key: 'node2222.png',
      blob: new Blob([await readFile('./node.png')])
    }
  ];

  data.forEach(
    async d => {
      // write
      await storage.putBlob(d.key, d.blob);
      // read
      const { value: blob_read } = await storage.getBlob(d.key);
      const url = await storage.getSigned(d.key);
      console.log('presign GET url ', url);

      // compare
      const equal = await areBlobsEqual(blob_read, d.blob);
      assert.ok(equal, 'Blobs are not equal !!!');

      // delete
      // await storage.remove(d.key);
    }
  );
  
});

test('blob put (presign)', async () => {
  const data = [
    // {
    //   key: 'folder1/tomer.txt',
    //   blob: new Blob(['this is some text from tomer :)']),
    // },
    {
      key: 'node_test2.png',
      blob: new Blob([await readFile('./node.png')])
    }
  ];

  data.forEach(
    async d => {
      // get put presigned url
      const { url, method, headers } = await storage.putSigned(d.key);
      // now let's use it to upload
      const r = await fetch(
        url, {
          method,
          headers,
          body: d.blob
        }
      );

      console.log(url)

      assert.ok(r.ok, 'upload failed')
    }
  );
  
});

test.run();
