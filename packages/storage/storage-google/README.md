# Storecraft Google Cloud Storage

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%' />
</div><hr/><br/>

**Storecraft** supports the `Google Storage` services. The service is 
serverless friendly. Through the `@storecraft/storage-google` package.

Features:
- Works in any `js` runtime and platform that supports `fetch`
- Supports streaming `Get` / `Put` / `Delete`
- Supports `presigned` `Get` / `Put` requests to offload to client

## How-to
1. Create a bucket at `GCP console` or even at `firebase`
2. Download the `service json file`

Use the values of the service file.

Note:
- You can use an empty constructor and upon `StoreCraft` init, the platform
environment variables will be used by this storage if needed.


## Usage

```bash
npm i @storecraft/storage-google
```
  
then,

```ts
import { App } from '@storecraft/core';
import { GoogleStorage } from '@storecraft/storage-google';

const app = new App()
.withPlatform(new NodePlatform())
.withDatabase(new MongoDB())
.withStorage(
  new GoogleStorage(
    {
      bucket: process.env.GS_BUCKET, 
      client_email: process.env.GS_CLIENT_EMAIL, 
      private_key: process.env.GS_PRIVATE_KEY, 
      private_key_id: process.env.GS_PRIVATE_KEY_ID
    }
  )
);
  
await app.init();
```

## config

Storecraft will search the following `env` variables

```bash
GS_BUCKET=...
GS_CLIENT_EMAIL=...
GS_PRIVATE_KEY=...
GS_PRIVATE_KEY_ID=...
```

So, you can instantiate with empty config

```ts
.withStorage(
  new GoogleStorage()
)
```

```text
Author: Tomer Shalev (tomer.shalev@gmail.com)
```