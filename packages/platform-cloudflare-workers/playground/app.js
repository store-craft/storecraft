import 'dotenv/config';
import { join } from "node:path";
import { homedir } from "node:os";

import { CloudflareWorkersPlatform } from '@storecraft/platform-cloudflare-workers'
import { MongoDB } from '@storecraft/database-mongodb-node'
import { NodeLocalStorage } from '@storecraft/storage-node-local'
import { App } from '@storecraft/core';
 
export const app = new App(
  new CloudflareWorkersPlatform(),
  new MongoDB({ db_name: 'test' }),
  new NodeLocalStorage(join(homedir(), 'tomer')),
  null, 
  {
    storage_rewrite_urls: undefined,
    general_store_name: 'Wush Wush Games',
    general_store_description: 'We sell cool retro video games',
    general_store_website: 'https://wush.games',
  }
);
