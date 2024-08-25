import { NodePlatform } from "@storecraft/platforms/node"
import { Turso } from "@storecraft/database-turso"
import { NodeLocalStorage } from "@storecraft/storage-local/node"
import { MailerSendGrid } from "@storecraft/mailer-providers-http/sendgrid"
import { Stripe } from "@storecraft/payments-stripe"
import { App } from "@storecraft/core"

export const app = new App({
  general_store_name: "wush",
  auth_admins_emails: ["a@a.com"],
})
  .withPlatform(new NodePlatform({}))
  .withDatabase(
    new Turso({
      prefers_batch_over_transactions: true,
      libsqlConfig: {
        url: "libsql://",
        authToken: "blahblah",
      },
    }),
  )
  .withStorage(new NodeLocalStorage("test"))
  .withMailer(
    new MailerSendGrid({ apikey: "scisidsd" }),
  )
  .withPaymentGateways({
    stripe: new Stripe({
      stripe_intent_create_params: {
        currency: "USD",
      },
      publishable_key: "sdcsdcsd",
      secret_key: "sdvsdv",
      stripe_config: {},
    }),
  })
