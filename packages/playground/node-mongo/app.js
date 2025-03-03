import { join } from "node:path";
import { homedir } from "node:os";

import { PostmanExtension } from "@storecraft/core/extensions/postman";
import { MongoDB } from '@storecraft/database-mongodb'
import { R2 } from '@storecraft/storage-s3-compatible'
import { GoogleStorage } from '@storecraft/storage-google'
import { Paypal } from '@storecraft/payments-paypal'
import { DummyPayments } from '@storecraft/core/payments/dummy'
import { Stripe } from '@storecraft/payments-stripe'
import { Resend } from '@storecraft/mailer-providers-http/resend'
import { App } from '@storecraft/core';
import { NodePlatform } from '@storecraft/core/platform/node';
import { NodeLocalStorage } from '@storecraft/core/storage/node';
import { Anthropic } from "@storecraft/core/ai/models/chat/anthropic";
import { Groq } from "@storecraft/core/ai/models/chat/groq";
import { Gemini } from "@storecraft/core/ai/models/chat/gemini";
import { Mistral } from "@storecraft/core/ai/models/chat/mistral";
import { XAI } from "@storecraft/core/ai/models/chat/xai";
import { OpenAI } from "@storecraft/core/ai/models/chat/openai";
import { MongoVectorStore } from "@storecraft/database-mongodb";
import { Vectorize } from "@storecraft/core/ai/models/vector-stores/vectorize/index.js";
import { CloudflareEmbedder } from "@storecraft/core/ai/models/embedders/cloudflare/index.js";

export const app = new App(
  {
    auth_secret_access_token: 'auth_secret_access_token',
    auth_secret_refresh_token: 'auth_secret_refresh_token',
    auth_admins_emails: ['john@doe.com'],
    storage_rewrite_urls: undefined,
    general_store_name: 'Wush Wush Games',
    general_store_description: 'We sell cool retro video games',
    general_store_website: 'https://wush.games',
    general_store_support_email: 'support@storecraft.app',
    general_confirm_email_base_url: 'https://wush.games/api/auth/confirm-email',
    general_forgot_password_confirm_base_url: 'https://wush.games/api/auth/forgot-password-request-confirm'
  }
)
.withPlatform(new NodePlatform())
.withDatabase(new MongoDB({ db_name: 'test' }))
.withStorage(new NodeLocalStorage(join(homedir(), 'tomer')))
.withMailer(new Resend({ apikey: process.env.RESEND_API_KEY }))
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
.withExtensions(
  {
    'postman': new PostmanExtension()
  }
)
.withAI(
  new XAI(
    {
      api_key: process.env.XAI
      // api_key: process.env.Anthropic,
    }
  )
)
.withVectorStore(
  new MongoVectorStore(
    {
      dimensions: 1536,
      embedder: new CloudflareEmbedder({account_id:'', api_key:'', cf_email:''}),
    }
  )
)

