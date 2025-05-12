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

## AWS S3

```js
import { App } from '@storecraft/core';
import { S3 } from '@storecraft/storage-s3-compatible'

const app = new App()
.withPlatform(new NodePlatform())
.withDatabase(new MongoDB())
.withStorage(
  new S3(
    {
      forcePathStyle: FORCE_PATH_STYLE,
      bucket: process.env.S3_BUCKET,
      region: process.env.S3_REGION,
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_KEY
    }
  )
).init();
```

## config

Storecraft will search the following `env` variables

```bash
S3_BUCKET=...
S3_REGION=...
S3_ACCESS_KEY_ID=...
S3_SECRET_KEY=...
```

So, you can instantiate with empty config

```ts
.withStorage(
  new S3()
)
```


## Cloudflare R2

```js
import { App } from '@storecraft/core';
import { R2 } from '@storecraft/storage-s3-compatible'

const app = new App()
.withPlatform(new NodePlatform())
.withDatabase(new MongoDB())
.withStorage(
  new R2(
    {
      account_id: process.env.CF_ACCOUNT_ID,
      bucket: process.env.S3_BUCKET,
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
    }
  )
).init();

```

## config

Storecraft will search the following `env` variables

```bash
CF_ACCOUNT_ID=...
S3_BUCKET=...
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
```

So, you can instantiate with empty config

```ts
.withStorage(
  new R2()
)
```

### Any S3 compatible storage (minio for example)

```js
import { App } from '@storecraft/core';
import { S3CompatibleStorage } from '@storecraft/storage-s3-compatible'

const app = new App()
.withPlatform(new NodePlatform())
.withDatabase(new MongoDB())
.withStorage(
  new S3CompatibleStorage(
    {
      endpoint: process.env.S3_ENDPOINT,
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      bucket: process.env.S3_BUCKET,
      region: process.env.S3_REGION
      forcePathStyle: true,
    }
  )
).init();
```

## config

Storecraft will search the following `env` variables

```bash
S3_ENDPOINT=...
S3_BUCKET=...
S3_REGION=...
S3_ACCESS_KEY_ID=...
S3_SECRET_KEY=...
```

So, you can instantiate with empty config

```ts
.withStorage(
  new S3CompatibleStorage()
)
```


```text
Author: Tomer Shalev (tomer.shalev@gmail.com)
```