import 'dotenv/config';
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { NodeLocalStorage } from '../node/index.js'
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os'
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const areBlobsEqual = async (blob1, blob2) => {
  return !Buffer.from(await blob1.arrayBuffer()).compare(
    Buffer.from(await blob2.arrayBuffer())
  );
};

const storage = new NodeLocalStorage(path.join(homedir(), 'tomer'));

test.before(async () => {await storage.init()})

test('blob put/get/delete', async () => {
  const data = [
    {
      key: 'folder1/tomer.txt',
      blob: new Blob(['this is some text from tomer :)']),
    },
    {
      key: 'folder1/node.png',
      blob: new Blob([await readFile(path.join(__dirname, 'node.png'))])
    }
  ];

  data.forEach(
    async d => {
      // write
      await storage.putBlob(d.key, d.blob);
      // read
      const { value: blob_read } = await storage.getBlob(d.key);
      // compare
      const equal = await areBlobsEqual(blob_read, d.blob);
      assert.ok(equal, 'Blobs are not equal !!!');

      // delete
      // await storage.remove(d.key);
    }
  );
  
});

test.run();
