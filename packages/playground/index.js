import 'dotenv/config';
import http from "node:http";
import { join } from "node:path";
import { homedir } from "node:os";

import { NodePlatform } from '@storecraft/platform-node'
import { MongoDB } from '@storecraft/database-mongodb-node'
import { NodeLocalStorage } from '@storecraft/storage-node-local'
import { R2 } from '@storecraft/storage-s3-compatible'
import { GoogleStorage } from '@storecraft/storage-google'
import { PaypalStandard } from '@storecraft/payments-paypal-standard'
import { App } from '@storecraft/core';
 
let app = new App(
  new NodePlatform(),
  new MongoDB({ db_name: 'test' }),
  new NodeLocalStorage(join(homedir(), 'tomer'))
  // new R2(process.env.R2_BUCKET, process.env.R2_ACCOUNT_ID, process.env.R2_ACCESS_KEY_ID, process.env.R2_SECRET_ACCESS_KEY )
  // new GoogleStorage()
  ,
  {
    'paypal_standard': new PaypalStandard({})
  }
);

await app.init();
 
const server = http.createServer(app.handler).listen(
  8000,
  () => {
    console.log(`Server is running on http://localhost:8000`);
  }
); 
