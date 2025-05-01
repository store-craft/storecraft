import { OpenAI } from "@storecraft/core/ai/models/chat/openai"
import { CloudflareEmbedder } from "@storecraft/core/ai/models/embedders/cloudflare"
import { Vectorize } from "@storecraft/core/ai/models/vector-stores/vectorize"
import { CloudflareWorkersPlatform } from "@storecraft/core/platform/cloudflare-workers"
import {
  type ExportedHandler,
  type ExecutionContext,
  type Request,
  type Response,
} from "@cloudflare/workers-types"
import { D1_WORKER } from "@storecraft/database-cloudflare-d1"
import { R2 } from "@storecraft/storage-s3-compatible"
import { Resend } from "@storecraft/mailer-providers-http/resend"
import { Stripe } from "@storecraft/payments-stripe"
import { App } from "@storecraft/core"
import { PostmanExtension } from "@storecraft/core/extensions/postman"

export default {
  /**
   * This is the standard fetch handler for a Cloudflare Worker
   *
   * @param request - The request submitted to the Worker from the client
   * @param env - The interface to reference bindings declared in wrangler.toml
   * @param ctx - The execution context of the Worker
   * @returns The response to be sent back to the client
   */
  async fetch(
    request: Request,
    env,
    ctx,
  ): Promise<Response> {
    const app = new App({
      general_store_name: "my-storecraft-app",
      auth_admins_emails: ["john@storecraft.app"],
      general_store_support_email:
        "support@storecraft.app",
    })
      .withPlatform(
        new CloudflareWorkersPlatform({ env }),
      )
      .withDatabase(new D1_WORKER({}))
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

    await app.init()

    const response = await app.handler(request)

    return response
  },
} satisfies ExportedHandler<Env>
