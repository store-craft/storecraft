# Storecraft Local FileSystem Storage for node, deno and bun

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%'' />
</div><hr/><br/>

Local filesystem based **Storage** for `node.js`.

Features:
- Supports streaming `Get` / `Put` / `Delete`

```bash
npm i @storecraft/storage-local
```

## usage

Example Node.js 

```js
import { NodeLocalStorage } from '@storecraft/storage-local/node';
import { BunLocalStorage } from '@storecraft/storage-local/bun';
import { DenoLocalStorage } from '@storecraft/storage-local/deno';

const storage = new Storage(path.join(homedir(), 'tomer'));

// write
const key = 'folder1/tomer.txt';
await storage.putBlob(
  key,
  new Blob(['this is some text from tomer :)'])
);
// read
const { value } = await storage.getBlob(key);
```

```text
Author: Tomer Shalev (tomer.shalev@gmail.com)
```