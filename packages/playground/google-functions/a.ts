import { GoogleFunctionsPlatform } from '@storecraft/platforms/google-functions'
import { MongoDB } from '@storecraft/database-mongodb-node'
import { GoogleStorage } from '@storecraft/storage-google'
import { Paypal } from '@storecraft/payments-paypal'
import { App } from '@storecraft/core';

export const app = new App(
  {
    storage_rewrite_urls: undefined,
    general_store_name: 'Wush Wush Games',
    general_store_description: 'We sell cool retro video games',
    general_store_website: 'https://wush.games',
    auth_admins_emails: ['john@doe.com']
  }
)
.withPlatform(new GoogleFunctionsPlatform())
.withDatabase(new MongoDB({ db_name: 'test' }))
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
  }
)
