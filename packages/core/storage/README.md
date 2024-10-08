# Storecraft Local FileSystem Storage for node, deno and bun

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%' />
</div><hr/><br/>

Local filesystem based **Storage** for `node.js` / `Deno` / `Bun`.

Features:
- Supports streaming `Get` / `Put` / `Delete`


## usage

Example Node.js 

```js
import { NodeLocalStorage } from '@storecraft/core/storage/node';

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
import { DenoLocalStorage } from '@storecraft/core/storage/deno';

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
import { BunLocalStorage } from '@storecraft/core/storage/bun';

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
import { App } from '@storecraft/core';
import { NodePlatform } from '@storecraft/core/platform/node';
import { NodeLocalStorage } from '@storecraft/core/storage/node'
import { MongoDB, migrateToLatest } from '@storecraft/database-mongodb'
 
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