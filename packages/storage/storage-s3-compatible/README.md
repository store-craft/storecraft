# Storecraft S3 compatible storage

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%' />
</div><hr/><br/>

[![S3 Compatible](https://github.com/store-craft/storecraft/actions/workflows/test.storage-s3-compatible.yml/badge.svg)](https://github.com/store-craft/storecraft/actions/workflows/test.storage-s3-compatible.yml)

`fetch` ready support for an `S3` like storage:
- `Amazon S3`
- `Cloudflare R2`
- `DigitalOcean Spaces`
- `minIO` servers

Features:
- Works in any `js` runtime and platform that supports `fetch`
- Supports streaming `Get` / `Put` / `Delete`
- Supports `presigned` `Get` / `Put` requests to offload to client

```bash
npm i @storecraft/storage-s3-compatible
```

## usage

```js
import { R2, S3, DigitalOceanSpaces, S3CompatibleStorage } from '@storecraft/storage-s3-compatible'

const storage = new R2({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  account_id: process.env.CF_ACCOUNT_ID,
  bucket: process.env.S3_BUCKET,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
});

// write
await storage.putBlob(
  'folder1/tomer.txt', 
  new Blob(['this is some text from tomer :)'])
);

// read
const { value } = await storage.getBlob('folder1/tomer.txt');
const url = await storage.getSigned('folder1/tomer.txt');
console.log('presign GET url ', url);

```

## In Storecraft App

```js
import { App } from '@storecraft/core';
import { MongoDB, migrateToLatest } from '@storecraft/database-mongodb';
import { NodePlatform } from '@storecraft/core/platform/node';
import { R2 } from '@storecraft/storage-s3-compatible'

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
  new R2() // config will be inferred by env variables
);

await app.init();
await migrateToLatest(app.db, false);

```

```text
Author: Tomer Shalev (tomer.shalev@gmail.com)
```