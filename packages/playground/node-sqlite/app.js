import { PostmanExtension } from "@storecraft/core/extensions/postman";
import { SQLite } from '@storecraft/database-sqlite'
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
import { GroqCloud } from "@storecraft/core/ai/models/chat/groq-cloud";
import { Gemini } from "@storecraft/core/ai/models/chat/gemini";
import { Mistral } from "@storecraft/core/ai/models/chat/mistral";
import { XAI } from "@storecraft/core/ai/models/chat/xai";
import { OpenAI } from "@storecraft/core/ai/models/chat/openai";
import { Vectorize } from "@storecraft/core/ai/models/vector-stores/vectorize";
import { CloudflareEmbedder } from "@storecraft/core/ai/models/embedders/cloudflare";

export const app = new App(
  {
    auth_secret_access_token: 'auth_secret_access_token',
    auth_secret_refresh_token: 'auth_secret_refresh_token',
    auth_secret_confirm_email_token: 'auth_secret_confirm_email_token',
    auth_secret_forgot_password_token: 'auth_secret_forgot_password_token',
    auth_admins_emails: ['tomer.shalev@gmail.com'],
    general_store_name: 'Wush Wush Games',
    general_store_description: 'We sell cool retro video games',
    general_store_website: 'https://wush.games',
    general_store_support_email: 'support@storecraft.app',
    general_confirm_email_base_url: 'https://wush.games/api/auth/confirm-email',
    general_forgot_password_confirm_base_url: 'https://wush.games/api/auth/forgot-password-request-confirm'
  }
)
.withPlatform(new NodePlatform())
.withDatabase(
  new SQLite({
    options: {},
    filepath: "data.db",
  }),
)
.withStorage(new NodeLocalStorage("storage"))
.withMailer(new Resend({ apikey: process.env.RESEND_API_KEY }))
.withPaymentGateways(
  {
    'paypal': new Paypal({ env: 'test' }),
    'stripe': new Stripe(),
    'dummy_payments': new DummyPayments(),
  }
)
.withExtensions(
  {
    'postman': new PostmanExtension()
  }
)
.withAI(
  new XAI()
)
.withVectorStore(
  new Vectorize(
    {
      embedder: new CloudflareEmbedder()
    }
  )
).init()