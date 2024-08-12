# Storecraft Turso (libsql) Database support

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       height='150px' />
</div><hr/><br/>

Official `Turso` / `libSql` driver for `StoreCraft` on any platforms.

```bash
npm i @storecraft/database-cloudflare-d1
```

## Setup

- First, login to your turso account.
- Create a database.
- Create an API Key.


## usage

```js
import 'dotenv/config';
import http from "node:http";
import { join } from "node:path";
import { homedir } from "node:os";

import { App } from '@storecraft/core'
import { NodePlatform } from '@storecraft/platform-node'
import { Turso } from '@storecraft/database-turso'
import { NodeLocalStorage } from '@storecraft/storage-node-local'

let app = new App(
  new NodePlatform(),
  new Turso({ url, database_id, api_token}),
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