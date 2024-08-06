# Storecraft S3 compatible storage

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       height='150px' />
</div><hr/><br/>

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
import { R2 } from '@storecraft/storage-s3-compatible'

const storage = new R2(
  process.env.R2_BUCKET, process.env.R2_ACCOUNT_ID, 
  process.env.R2_ACCESS_KEY_ID, process.env.R2_SECRET_ACCESS_KEY
  );

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

```text
Author: Tomer Shalev (tomer.shalev@gmail.com)
```