import 'dotenv/config';
import * as assert from 'uvu/assert';
import { R2 } from '../adapter.js'
import { readFile } from 'node:fs/promises';
import { storage as storage_test_runner } from '@storecraft/core/test-runner'


/**
 * @param {Blob} blob1 
 * @param {Blob} blob2 
 */
const areBlobsEqual = async (blob1, blob2) => {
  const array1 = new Uint8Array(await blob1.arrayBuffer());
  const array2 = new Uint8Array(await blob2.arrayBuffer());

  if (array1.length !== array2.length) return false;

  for (let i = 0; i < array1.length; i++) {
    if (array1[i] !== array2[i]) return false;
  }

  return true;
};

const storage = new R2({
  account_id: process.env.CF_ACCOUNT_ID,
  bucket: process.env.S3_BUCKET,
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
});

const suite = storage_test_runner.create(storage);

suite.before(async () => { await storage.init(undefined) });

suite('bad get', async () => {
  const v = await storage.getBlob('i-dont-exist.png');
  assert.not(v.value, 'should not exist');
});


suite('blob put/get/delete', async () => {
  const data = [
    {
      key: 'folder2/node2222.png',
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

suite('blob put (presign)', async () => {
  const data = [
    {
      key: 'folder2/node_test2.png',
      blob: new Blob([await readFile('./node.png')])
    }
  ];

  data.forEach(
    async d => {
      // get put presigned url
      const { 
        url, method, headers 
      } = await storage.putSigned(d.key);
      // now let's use it to upload
      const r = await fetch(
        url, {
          method,
          headers,
          body: d.blob
        }
      );

      assert.ok(r.ok, 'upload failed')

      { // now let's read it back, once with presigned url
        const {
          method, url, headers
        } = await storage.getSigned(d.key);
        const r_get = await fetch(
          url, {
            method,
            headers,
          }
        );

        // compare
        const equal = await areBlobsEqual(await r_get.blob(), d.blob);
        assert.ok(equal, 'Blobs are not equal when compared with presigned get !!!');
      }
      { // now let's read it back with normal get
        const { value: blob_read } = await storage.getBlob(d.key);
        // compare
        const equal = await areBlobsEqual(blob_read, d.blob);
        assert.ok(equal, 'Blobs are not equal with regular get !!!');
      }      
    }
  );
  
});

suite.run();
