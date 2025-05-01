import { OpenAI } from "@storecraft/core/ai/models/chat/openai"
import { CloudflareEmbedder } from "@storecraft/core/ai/models/embedders/cloudflare"
import { Vectorize } from "@storecraft/core/ai/models/vector-stores/vectorize"
import { NodePlatform } from "@storecraft/core/platform/node"
import { D1_HTTP } from "@storecraft/database-cloudflare-d1"
import { R2 } from "@storecraft/storage-s3-compatible"
import { Resend } from "@storecraft/mailer-providers-http/resend"
import { Stripe } from "@storecraft/payments-stripe"
import { App } from "@storecraft/core"
import { PostmanExtension } from "@storecraft/core/extensions/postman"

export const app = new App({
  general_store_name: "my-storecraft-app",
  auth_admins_emails: ["john@storecraft.app"],
  general_store_support_email:
    "support@storecraft.app",
})
  .withPlatform(new NodePlatform({}))
  .withDatabase(new D1_HTTP({}))
  .withStorage(new R2({}))
  .withMailer(new Resend({}))
  .withPaymentGateways({
    stripe: new Stripe({
      stripe_intent_create_params: {
        currency: "USD",
      },
    }),
  })
  .withExtensions({
    postman: new PostmanExtension(),
  })
  .withAI(new OpenAI({ model: "gpt-4" }))
  .withVectorStore(
    new Vectorize({
      embedder: new CloudflareEmbedder({
        model: "@cf/baai/bge-large-en-v1.5",
      }),
    }),
  )
