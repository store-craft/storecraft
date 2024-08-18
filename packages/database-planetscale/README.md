# Storecraft Planetscale (cloud mysql) Database support

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       height='150px' />
</div><hr/><br/>

Official `Planetscale` (cloud MySql) driver for `StoreCraft` on any platforms.

```bash
npm i @storecraft/database-neon
```

## Setup

- First, login to your [planetscale](https://planetscale.com/) account.
- Create a database.
- Copy the `connection string`.


## usage

```js
import 'dotenv/config';
import http from "node:http";
import { join } from "node:path";
import { homedir } from "node:os";

import { App } from '@storecraft/core'
import { NodePlatform } from '@storecraft/platforms/node';
import { PlanetScale } from '@storecraft/database-planetscale'
import { NodeLocalStorage } from '@storecraft/storage-local/node'

let app = new App(
  new NodePlatform(),
  new PlanetScale(
    { 
      url: process.env.PLANETSCALE_CONNECTION_URL,
      useSharedConnection: true
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