import { join } from "node:path";
import { homedir } from "node:os";

import { DenoPlatform } from '@storecraft/platforms/deno'
import { DenoLocalStorage } from '@storecraft/storage-local/deno'
import { MongoDB } from '@storecraft/database-mongodb-node'
import { R2 } from '@storecraft/storage-s3-compatible'
import { GoogleStorage } from '@storecraft/storage-google'
import { Paypal } from '@storecraft/payments-paypal'
import { DummyPayments } from '@storecraft/payments-dummy'
import { Stripe } from '@storecraft/payments-stripe'
import { App } from '@storecraft/core';
 
export const app = new App(
  {
    storage_rewrite_urls: undefined,
    general_store_name: 'Wush Wush Games',
    general_store_description: 'We sell cool retro video games',
    general_store_website: 'https://wush.games',
  }
)
.withPlatform(new DenoPlatform())
.withDatabase(new MongoDB({ db_name: 'test' }))
.withStorage(new DenoLocalStorage(join(homedir(), 'tomer')))
.withPaymentGateways(
  {
    'paypal': new Paypal(
      { 
        client_id: process.env.PAYPAL_CLIENT_ID, 
        secret: process.env.PAYPAL_SECRET, 
        intent_on_checkout: 'AUTHORIZE',
        env: 'test' 
      }
    ),
    'stripe': new Stripe(
      { 
        publishable_key: process.env.STRIPE_PUBLISHABLE_KEY, 
        secret_key: process.env.STRIPE_SECRET_KEY, 
        webhook_endpoint_secret: process.env.STRIPE_WEBHOOK_SECRET
      }
    ),
    'dummy_payments': new DummyPayments({ intent_on_checkout: 'AUTHORIZE' }),
  }
)
