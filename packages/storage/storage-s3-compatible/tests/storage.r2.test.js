import 'dotenv/config';
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { R2 } from '../adapter.js'
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os'
import * as path from 'node:path';

const areBlobsEqual = async (blob1, blob2) => {
  return !Buffer.from(await blob1.arrayBuffer()).compare(
    Buffer.from(await blob2.arrayBuffer())
  );
};

const storage = new R2({
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  account_id: process.env.R2_ACCOUNT_ID,
  bucket: process.env.R2_BUCKET,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
});

test.before(async () => { await storage.init(null) })

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

      assert.ok(r.ok, 'upload failed')
    }
  );
  
});

test.run();
