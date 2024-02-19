import 'dotenv/config';
import http from "node:http";
import { join } from "node:path";
import { homedir } from "node:os";

import { App } from '@storecraft/core'
import { Platform } from '@storecraft/platform-node'
import { MongoDB } from '@storecraft/db-mongodb-node'
import { Storage } from '@storecraft/storage-node-local'
import { R2 } from '@storecraft/storage-s3-compatible'
import { GoogleStorage } from '@storecraft/storage-google'

let app = new App(
  new Platform(),
  new MongoDB(),
  // new Storage(join(homedir(), 'tomer'))
  // new R2(process.env.R2_BUCKET, process.env.R2_ACCOUNT_ID, process.env.R2_ACCESS_KEY_ID, process.env.R2_SECRET_ACCESS_KEY )
  new GoogleStorage(process.env.GS_BUCKET, process.env.GS_CLIENT_EMAIL, process.env.GS_PRIVATE_KEY, process.env.GS_PRIVATE_KEY_ID )
);

await app.init();
 
const server = http.createServer(app.handler).listen(
  8000,
  () => {
    console.log(`Server is running on http://localhost:8000`);
  }
); 
