<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       height='150px' />
</div><hr/><br/>

The `StoreCraft` mono-repo

```js
import { App } from '@storecraft/core'
import { NodePlatform } from '@storecraft/platforms/node'
import { MongoDB } from '@storecraft/database-mongodb-node'
import { NodeLocalStorage } from '@storecraft/storage-local/node'
import { R2 } from '@storecraft/storage-s3-compatible'
import { GoogleStorage } from '@storecraft/storage-google'

const app = new App(
  {
    auth_admins_emails: ['john@doe.com']
  }
)
.withPlatform(new NodePlatform())
.withDatabase(new MongoDB({ db_name: 'test' }))
.withStorage(new GoogleStorage())
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

await app.init();
 
const server = http.createServer(app.handler).listen(
  8000,
  () => {
    console.log(`Server is running on http://localhost:8000`);
  }
);

```

## packages
**platforms**
- `@storecraft/platforms/node` - platform support 
- `@storecraft/platform-aws-lambda` - soon
- `@storecraft/platform-cloudflare-workers` - soon
- `@storecraft/google-functions` - soon

**Databases**
- `@storecraft/database-sql-base` - Universal pure javascript support for `SQLite` / `MySQL` / `Postgres` dialects with `Kysely`
- `@storecraft/database-mongodb-node` - Mongodb support on node
- `@storecraft/database-mongodb-atlas-data-api` - Mongodb support for fetch (without transactions) (http)
- `@storecraft/database-firestore` - (maybe soon) Google firestore support (http)
- `@storecraft/database-turso` - (soon) Turso database support (http)
- `@storecraft/database-cloudflare-d1` - (soon) Cloudflare D1 database support (http)
- `@storecraft/database-neon` - (soon) Neon Postgres database support (http)
- `@storecraft/database-vercel-postgres` - (soon) Neon Postgres database support (http)
- `@storecraft/database-planetscale` - (soon) Planetscale MySQL database support (http)

**storage**
- `@storecraft/storage-local` - local filesystem storage support 
- `@storecraft/storage-google` - google storage support (http)
- `@storecraft/storage-s3-compatible` - **aws s3** / **cloudflare r2** / **digitalocean spaces** / **minio** support (http)

**email**
- `@storecraft/mailer-smtp-node` - node smtp support
- `@storecraft/mailer-mailchimp-http` - mailchimp support (on http)
- `@storecraft/mailer-mailgun-http` - mailgun support (on http)
- `@storecraft/mailer-resend-http` - resend support (on http)
- `@storecraft/mailer-sendgrid-http` - sendgrid support (on http)

**payments**
- `@storecraft/payments-paypal-standard` - paypal standard payments (on http)
- `@storecraft/payments-stripe` - (soon) Stripe payments (on http)

**tools**
- `@storecraft/test-runner` - integration tests for new databases and plugins

```text
Author: Tomer Shalev (tomer.shalev@gmail.com)
```
