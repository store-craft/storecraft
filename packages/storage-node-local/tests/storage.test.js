import 'dotenv/config';
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { Storage } from '../adapter.js'
import { mkdir, readFile } from 'node:fs/promises';
import { homedir } from 'node:os'
import * as path from 'node:path';

const areBlobsEqual = async (blob1, blob2) => {
  return !Buffer.from(await blob1.arrayBuffer()).compare(
    Buffer.from(await blob2.arrayBuffer())
  );
};

const storage = new Storage(path.join(homedir(), 'tomer'));

test.before(async () => await storage.init())

test('text put/get', async () => {
  const text_write = 'this is some text from tomer :)';
  const blob_write = new Blob([text_write]);
  const key = await storage.put(
    '/folder1/tomer.txt',
    blob_write
  );

  const blob_read = await storage.get(key);
  const text_read = await blob_read.text();

  assert.ok(await areBlobsEqual(blob_read, blob_write), 'Blobs are not equal !!!');
});

test('image put/get', async () => {

  const file = await readFile('./node.png');
  const blob_write = new Blob([file]);
  const key = await storage.put(
    '/folder1/node.png',
    blob_write
  );

  const blob_read = await storage.get(key);

  assert.ok(await areBlobsEqual(blob_read, blob_write), 'Blobs are not equal !!!');
});

test.run()
