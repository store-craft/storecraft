# Storecraft Neon (cloud postgres) Database support

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       height='150px' />
</div><hr/><br/>

Official `Neon` driver for `StoreCraft` on any platforms.

```bash
npm i @storecraft/database-neon
```

## Setup

- First, login to your [neon account](https://neon.tech) account.
- Create a database.
- Copy the `connection string`.


## usage

```js
import 'dotenv/config';
import http from "node:http";
import { join } from "node:path";
import { homedir } from "node:os";

import { App } from '@storecraft/core'
import { NodePlatform } from '@storecraft/platform-node'
import { Neon } from '@storecraft/database-neon'
import { NodeLocalStorage } from '@storecraft/storage-node-local'

let app = new App(
  new NodePlatform(),
  new NeonHttp(
    { 
      connectionString: process.env.NEON_CONNECTION_URL
    }
  ),
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