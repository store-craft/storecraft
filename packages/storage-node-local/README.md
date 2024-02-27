# Storecraft Node.js Local FileSystem Storage

Local filesystem based **Storage** for `node.js`.

Features:
- Supports streaming `Get` / `Put` / `Delete`

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