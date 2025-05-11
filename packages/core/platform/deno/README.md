# Storecraft deno Platform support

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%' />
</div><hr/><br/>

So, if you wanted to run `StoreCraft` on `deno`, this is the `platform`
package for you :)


## usage

```js
import 'dotenv/config';
import { App } from '@storecraft/core'
import { DenoPlatform } from '@storecraft/core/platform/deno';
import { DenoLocalStorage } from '@storecraft/core/storage/deno'
import { MongoDB } from '@storecraft/database-mongodb'

const app = new App(config)
.withPlatform(new NodePlatform())
.withDatabase(new MongoDB())
.withStorage(new DenoLocalStorage('storage'))
.init();

Deno.serve({
  port: 8000,
  fetch: app.handler,
  onListen: () => {
    app.print_banner('http://localhost:8000');
  }
});
```

```text
Author: Tomer Shalev (tomer.shalev@gmail.com)
```