# Storecraft Node.js Platform support

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%' />
</div><hr/><br/>

So, if you wanted to run `StoreCraft` on the following platforms,
- Node.js
- Deno
- Bun
- Cloudflare Workers
- Google Functions
- Azure Functions
- AWS Lambda Functions (with API Gateway)
- Vercel Platform (in the future)

## What does it do exactly ?
Basically, 
- Translates incoming messages into web [Request]()
- Translates outgoing messages into web [Response]()
- Exposes `environmant` variables
- Adds helpers

## usage

```js
import 'dotenv/config';
import http from "node:http";
import { join } from "node:path";
import { homedir } from "node:os";

import { App } from '@storecraft/core'
import { NodePlatform } from '@storecraft/core/platform/node'
import { MongoDB } from '@storecraft/database-mongodb'
import { NodeLocalStorage } from '@storecraft/core/storage/node'

const app = new App(config)
  .withPlatform(new NodePlatform())
  .withDatabase(new MongoDB())
  .withStorage(new NodeLocalStorage(join(homedir(), 'tomer')))
  .init();
 
http.createServer(app.handler).listen(
  8000,
  () => {
    app.print_banner('http://localhost:8000');
  }
); 

```

```text
Author: Tomer Shalev (tomer.shalev@gmail.com)
```