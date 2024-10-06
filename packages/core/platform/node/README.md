# Storecraft Node.js Platform support

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%' />
</div><hr/><br/>

So, if you wanted to run `StoreCraft` on `node.js`, this is the `platform`
package for you :)

## What does it do exactly ?
Basically, it translates native **Node** `http.IncomingMessage` into Web API `Request`,
and also streams result from Web API `Response` into **Node** `http.ServerResponse`.


## usage

```js
import 'dotenv/config';
import http from "node:http";
import { App } from '@storecraft/core'
import { NodePlatform } from '@storecraft/core/platform/node';
import { NodeLocalStorage } from '@storecraft/storage-local/node'
import { MongoDB } from '@storecraft/database-mongodb'

const app = new App(
    config
  )
  .withPlatform(new NodePlatform())
  .withDatabase(new MongoDB())
  .withStorage(new NodeLocalStorage('storage'))

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