import 'dotenv/config';
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { Storage } from '../adapter.js'
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os'
import * as path from 'node:path';

const areBlobsEqual = async (blob1, blob2) => {
  return !Buffer.from(await blob1.arrayBuffer()).compare(
    Buffer.from(await blob2.arrayBuffer())
  );
};

const storage = new Storage(path.join(homedir(), 'tomer'));

test.before(async () => await storage.init())

test('blob put/get/delete', async () => {
  const data = [
    {
      key: 'folder1/tomer.txt',
      blob: new Blob(['this is some text from tomer :)']),
    },
    {
      key: 'folder1/node.png',
      blob: new Blob([await readFile('./node.png')])
    }
  ];

  data.forEach(
    async d => {
      // write
      await storage.put(d.key, d.blob);
      // read
      const blob_read = await storage.get(d.key);
      // compare
      const equal = await areBlobsEqual(blob_read, d.blob);
      assert.ok(equal, 'Blobs are not equal !!!');

      // delete
      await storage.remove(d.key);
    }
  );
  
});

test.run();
