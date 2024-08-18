# Storecraft Node.js Local FileSystem Storage

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       height='150px' />
</div><hr/><br/>

Local filesystem based **Storage** for `node.js`.

Features:
- Supports streaming `Get` / `Put` / `Delete`

```bash
npm i @storecraft/storage-node-local
```

## usage

```js
import { NodeLocalStorage } from '@storecraft/storage-node-local';

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