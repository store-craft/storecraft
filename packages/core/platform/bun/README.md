# Storecraft Bun Platform support

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%' />
</div><hr/><br/>

So, if you wanted to run `StoreCraft` on `bun`, this is the `platform`
package for you :)


## usage

```js
import 'dotenv/config';
import { App } from '@storecraft/core'
import { BunPlatform } from '@storecraft/core/platform/bun';
import { BunLocalStorage } from '@storecraft/core/storage/bun'
import { MongoDB } from '@storecraft/database-mongodb'

const app = new App(config)
  .withPlatform(new NodePlatform())
  .withDatabase(new MongoDB())
  .withStorage(new BunLocalStorage('storage'))
  .init();

Bun.serve(
  {
    port: 8000,
    fetch: app.handler
  }
);

console.log(`Listening on http://localhost:${server.port} ...`);

```

```text
Author: Tomer Shalev (tomer.shalev@gmail.com)
```