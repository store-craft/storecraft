# Storecraft Cloudflare D1 Database support

Two variants,
1. D1 over http (used for migrations)
2. D1 over cloudflare-worker runtime (used for backend)

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       height='150px' />
</div><hr/><br/>

Official `Cloudflare D1` driver for `StoreCraft` on any platforms.

```bash
npm i @storecraft/database-cloudflare-d1
```

## Setup

- First, login to your cloudflare account.
- Create a `D1` database.
- Create an API Key at [here](https://dash.cloudflare.com/profile/api-tokens)


## usage

```js
import 'dotenv/config';
import http from "node:http";
import { join } from "node:path";
import { homedir } from "node:os";

import { App } from '@storecraft/core'
import { NodePlatform } from '@storecraft/platforms/node'
import { MongoDB } from '@storecraft/database-mongodb-node'
import { NodeLocalStorage } from '@storecraft/storage-local/node'

let app = new App(
  new NodePlatform(),
  new MongoDB({ db_name: 'prod', url: '<MONGO-URL>'}),
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
Author: Tomer Shalev <tomer.shalev@gmail.com>
```