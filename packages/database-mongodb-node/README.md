# Storecraft MongoDB driver for Node.js

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       height='150px' />
</div><hr/><br/>

Official `mongodb` driver for `StoreCraft` on **Node.js** platforms.

```bash
npm i @storecraft/database-mongodb-node
```

## usage

```js
import 'dotenv/config';
import http from "node:http";
import { join } from "node:path";
import { homedir } from "node:os";

import { App } from '@storecraft/core'
import { NodePlatform } from '@storecraft/platforms/node';
import { MongoDB } from '@storecraft/database-mongodb-node'
import { NodeLocalStorage } from '@storecraft/storage-local/node'

const app = new App(
  {
    auth_admins_emails: ['admin@sc.com'],
    auth_secret_access_token: 'auth_secret_access_token',
    auth_secret_refresh_token: 'auth_secret_refresh_token'
  }
)
.withPlatform(new NodePlatform())
.withDatabase(new MongoDB({ db_name: 'test'}))

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