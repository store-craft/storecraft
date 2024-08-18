# Storecraft Node.js Platform support

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       height='150px' />
</div><hr/><br/>

So, if you wanted to run `StoreCraft` on `node.js`, this is the `platform`
package for you :)

## What does it do exactly ?
Basically, it translates native **Node** `http.IncomingMessage` into Web API `Request`,
and also streams result from Web API `Response` into **Node** `http.ServerResponse`.

```bash
npm i @storecraft/platforms
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