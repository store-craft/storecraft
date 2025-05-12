import { join } from "node:path";
import { homedir } from "node:os";

import { DenoPlatform } from '@storecraft/core/platform/deno'
import { DenoLocalStorage } from '@storecraft/core/storage/deno'
import { MongoDB } from '@storecraft/database-mongodb'
import { R2 } from '@storecraft/storage-s3-compatible'
import { GoogleStorage } from '@storecraft/storage-google'
import { Paypal } from '@storecraft/payments-paypal'
import { DummyPayments } from '@storecraft/core/payments/dummy'
import { Stripe } from '@storecraft/payments-stripe'
import { App } from '@storecraft/core';
import { PostmanExtension } from "@storecraft/core/extensions/postman/index.js";

// @ts-ignore
const env = Deno.env.toObject();

export const app = new App({
  auth_secret_access_token: 'auth_secret_access_token',
  auth_secret_refresh_token: 'auth_secret_refresh_token',
  auth_secret_confirm_email_token: 'auth_secret_confirm_email_token',
  auth_secret_forgot_password_token: 'auth_secret_forgot_password_token',
  auth_admins_emails: ['john@doe.com', 'tomer.shalev@gmail.com'],
  storage_rewrite_urls: undefined,
  general_store_name: 'Wush Wush Games',
  general_store_description: 'We sell cool retro video games',
  general_store_website: 'https://wush.games',
})
.withPlatform(new DenoPlatform())
.withDatabase(new MongoDB({ db_name: 'test' }))
.withStorage(new DenoLocalStorage(join(homedir(), 'tomer')))
.withPaymentGateways({
  paypal: new Paypal({ 
    client_id: process.env.PAYPAL_CLIENT_ID, 
    secret: process.env.PAYPAL_SECRET, 
    intent_on_checkout: 'AUTHORIZE',
    env: 'test' 
  })
})
.withExtensions({
  postman: new PostmanExtension()
})
.init();
