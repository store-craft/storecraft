import { PostmanExtension } from "@storecraft/core/extensions/postman";
import { LibSQLVectorStore, LibSQL } from '@storecraft/database-turso'
import { DummyPayments } from '@storecraft/core/payments/dummy'
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
import { OpenAIEmbedder } from "@storecraft/core/ai/models/embedders/openai";
import { GoogleAuth } from "@storecraft/core/auth/providers/google";

export const app = new App({
  auth_admins_emails: ['tomer.shalev@gmail.com'],
  general_store_name: 'Wush Wush Games',
  general_store_description: 'We sell cool retro video games',
  general_store_support_email: 'support@storecraft.app',
})
.withPlatform(new NodePlatform())
.withDatabase(new LibSQL())
.withStorage(new NodeLocalStorage())
.withMailer(new Resend())
.withPaymentGateways({
  dummy_payments: new DummyPayments(),
})
.withExtensions({
  postman: new PostmanExtension(),
})
.withAI(
  // new XAI(),
  // new Gemini(),
  // new Mistral(),
  // new Anthropic(),
  // new GroqCloud(),
  new OpenAI({ 
    model: 'gpt-4o-mini', 
    api_key: null
  })
)
.withVectorStore(
  new LibSQLVectorStore({
    embedder: new OpenAIEmbedder({
      api_key: null
    }),
  })
)
.withAuthProviders({
  google: new GoogleAuth(),
})
.on(
  'products/get',
  e => {
    console.log(
      'read product: ', e.payload.current
    )
  }
)

