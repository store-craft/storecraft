# Storecraft Local FileSystem Storage for node, deno and bun

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%' />
</div><hr/><br/>

Local filesystem based **Storage** for `node.js` / `Deno` / `Bun`.

Features:
- Supports streaming `Get` / `Put` / `Delete`

```bash
npm i @storecraft/storage-local
```

## usage

Example Node.js 

```js
import { NodeLocalStorage } from '@storecraft/storage-local/node';

const storage = new NodeLocalStorage('storage');

// write
const key = 'folder1/tomer.txt';
await storage.putBlob(
  key,
  new Blob(['this is some text from tomer :)'])
);
// read
const { value } = await storage.getBlob(key);
```

Example Deno 

```ts
import { DenoLocalStorage } from '@storecraft/storage-local/deno';

const storage = new DenoLocalStorage('storage');

// write
const key = 'folder1/tomer.txt';
await storage.putBlob(
  key,
  new Blob(['this is some text from tomer :)'])
);
// read
const { value } = await storage.getBlob(key);
```

Example Bun

```js
import { BunLocalStorage } from '@storecraft/storage-local/bun';

const storage = new BunLocalStorage('storage');

// write
const key = 'folder1/tomer.txt';
await storage.putBlob(
  key,
  new Blob(['this is some text from tomer :)'])
);
// read
const { value } = await storage.getBlob(key);
```

## In Storecraft App

```js
import { NodePlatform } from '@storecraft/platforms/node';
import { MongoDB, migrateToLatest } from '@storecraft/database-mongodb'
import { NodeLocalStorage } from '@storecraft/storage-local/node'
import { App } from '@storecraft/core';
 
const app = new App(
  {
    storage_rewrite_urls: undefined,
    general_store_name: 'Wush Wush Games',
    general_store_description: 'We sell cool retro video games',
    general_store_website: 'https://wush.games',
    auth_secret_access_token: process.env.auth_secret_access_token,
    auth_secret_refresh_token: process.env.auth_secret_refresh_token
    auth_admins_emails: ['jonny@begood.com']
  }
)
.withPlatform(new NodePlatform())
.withDatabase(new MongoDB())
.withStorage(new NodeLocalStorage(join(homedir(), 'storage')))

await app.init();
await migrateToLatest(app.db, false);

```


```text
Author: Tomer Shalev (tomer.shalev@gmail.com)
```