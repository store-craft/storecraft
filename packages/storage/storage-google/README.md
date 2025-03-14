# Storecraft Google Cloud Storage

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%' />
</div><hr/><br/>

`fetch` ready support for an `GCP` **Storage**

Features:
- Works in any `js` runtime and platform that supports `fetch`
- Supports streaming `Get` / `Put` / `Delete`
- Supports `presigned` `Get` / `Put` requests to offload to client

```bash
npm i @storecraft/storage-google
```

## How-to
1. Create a bucket at `GCP console` or even at `firebase`
2. Download the `service json file`

Use the values of the service file.

Note:
- You can use an empty constructor and upon `StoreCraft` init, the platform
environment variables will be used by this storage if needed.

```js
import { GoogleStorage } from '@storecraft/storage-google';

const storage = new GoogleStorage({
  bucket: process.env.GS_BUCKET, 
  client_email: process.env.GS_CLIENT_EMAIL, 
  private_key: process.env.GS_PRIVATE_KEY, 
  private_key_id: process.env.GS_PRIVATE_KEY_ID
});

// write
await storage.putBlob(
  'folder1/tomer.txt', 
  new Blob(['this is some text from tomer :)'])
);

// read
const { value } = await storage.getBlob('folder1/tomer.txt');
const { url } = await storage.getSigned('folder1/tomer.txt');
console.log('presign GET url ', url);

```

## In Storecraft App

```js
import { App } from '@storecraft/core';
import { MongoDB, migrateToLatest } from '@storecraft/database-mongodb';
import { NodePlatform } from '@storecraft/core/platform/node';
import { GoogleStorage } from '@storecraft/storage-google';

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
.withStorage(
  new GoogleStorage() // config inferred from env variables
);
  
await app.init();
await migrateToLatest(app.db, false);

```


```text
Author: Tomer Shalev (tomer.shalev@gmail.com)
```