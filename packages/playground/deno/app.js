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
  new DenoPlatform(),
  new MongoDB({ db_name: 'test' }),
  new DenoLocalStorage(join(homedir(), 'tomer')),
  null, 
  {
    storage_rewrite_urls: undefined,
    general_store_name: 'Wush Wush Games',
    general_store_description: 'We sell cool retro video games',
    general_store_website: 'https://wush.games',
  }
).withPaymentGateways(
  {
    'paypal': new Paypal(
      { 
        client_id: Deno.env.get('PAYPAL_CLIENT_ID'), 
        secret: Deno.env.get('PAYPAL_SECRET'), 
        intent_on_checkout: 'AUTHORIZE',
        env: 'test' 
      }
    ),
    'stripe': new Stripe(
      { 
        publishable_key: Deno.env.get('STRIPE_PUBLISHABLE_KEY'), 
        secret_key: Deno.env.get('STRIPE_SECRET_KEY'), 
        webhook_endpoint_secret: Deno.env.get('STRIPE_WEBHOOK_SECRET')
      }
    ),
    'dummy_payments': new DummyPayments({ intent_on_checkout: 'AUTHORIZE' }),
  }
);