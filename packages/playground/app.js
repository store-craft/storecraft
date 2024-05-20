import 'dotenv/config';
import { join } from "node:path";
import { homedir } from "node:os";

import { NodePlatform } from '@storecraft/platform-node'
import { MongoDB } from '@storecraft/database-mongodb-node'
import { NodeLocalStorage } from '@storecraft/storage-node-local'
import { R2 } from '@storecraft/storage-s3-compatible'
import { GoogleStorage } from '@storecraft/storage-google'
import { PaypalStandard } from '@storecraft/payments-paypal-standard'
import { DummyPayments } from '@storecraft/payments-dummy'
import { App } from '@storecraft/core';
 
export const app = new App(
  new NodePlatform(),
  new MongoDB({ db_name: 'test' }),
  new NodeLocalStorage(join(homedir(), 'tomer'))
  // new R2(process.env.R2_BUCKET, process.env.R2_ACCOUNT_ID, process.env.R2_ACCESS_KEY_ID, process.env.R2_SECRET_ACCESS_KEY )
  // new GoogleStorage()
  ,
  {
    'paypal_standard': new PaypalStandard({ client_id: 'blah', secret: 'blah 2', env: 'prod' }),
    'dummy_payments': new DummyPayments({ intent_on_checkout: 'AUTHORIZE' })
  }, null, null, 
  {
    storage_rewrite_urls: undefined,
    general_store_name: 'Wush Wush Games',
    general_store_description: 'We sell cool retro video games',
    general_store_website: 'https://wush.games'
  }
);
