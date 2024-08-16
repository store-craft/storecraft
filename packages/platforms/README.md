# Storecraft Node.js Platform support

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       height='150px' />
</div><hr/><br/>

So, if you wanted to run `StoreCraft` on the following platforms,
- Node.js
- Deno
- Bun
- Cloudflare Workers
- Google Functions
- Azure Functions
- AWS Lambda Functions (with API Gateway)
- Vercel Platform

## What does it do exactly ?
Basically, 
- Translates incoming messages into web [Request]()
- Translates outgoing messages into web [Response]()
- Exposes `environmant` variables
- Adds helpers

```bash
npm i @storecraft/platform-node
```

## usage

```js
import 'dotenv/config';
import http from "node:http";
import { join } from "node:path";
import { homedir } from "node:os";

import { App } from '@storecraft/core'
import { NodePlatform } from '@storecraft/platforms/node'
import { MongoDB } from '@storecraft/database-mongodb-node'
import { NodeLocalStorage } from '@storecraft/storage-node-local'

let app = new App(
  new NodePlatform(),
  new MongoDB(),
  new NodeLocalStorage(join(homedir(), 'tomer'))
);

await app.init();
 
const server = http.createServer(app.handler).listen(
  8000,
  () => {
    console.log(`Server is running on http://localhost:8000`);
  }
); 

```

```text
Author: Tomer Shalev (tomer.shalev@gmail.com)
```