<div style="text-align:center">
  <div width="90%">
    <img src='https://storecraft.app/storecraft-color.svg' 
        width='100%' />
  </div>
  Commerce as Code
</div><hr/><br/>


# The <img src='https://storecraft.app/storecraft-color.svg' height='24px' style="transform: translateY(4px);" /> mono-repo

Hi 👋, `Storecraft` is a next generation Commerce As Code backend.

⭐ run on any javascript [platform](https://storecraft.app/docs/backend/platforms/node-js) (deno, bun, node, workers, aws, azure), serverless / serverful

⭐ connect to any [database](https://storecraft.app/docs/backend/databases/sql) (mongo, sqlite, postgres, mysql, neon, turso, planetscale)

⭐ use [storage](https://storecraft.app/docs/backend/storage/s3) (local, r2, s3 compatible and more)

⭐ It is [extensible and modular](https://storecraft.app/docs/backend/extensions/overview)

⭐ It is [event based](https://storecraft.app/docs/backend/events)

⭐ Boasts an official [Dashboard](https://storecraft.app/docs/dashboard/overview)

⭐ Well documented [REST-API](https://storecraft.app/docs/rest-api/api) (can also be found in your `/api/reference` endpoint)

⭐ Visit the [website](https://storecraft.app/docs)

<hr/><br/>

```js
import { App } from '@storecraft/core'
import { NodePlatform } from '@storecraft/platforms/node'
import { MongoDB, migrateToLatest } from '@storecraft/database-mongodb-node'
import { R2 } from '@storecraft/storage-s3-compatible'

const app = new App(
  {
    auth_admins_emails: ['john@doe.com']
  }
)
.withPlatform(new NodePlatform())
.withDatabase(new MongoDB({ db_name: 'test' }))
.withStorage(new R2())
.withPaymentGateways(
  {
    'stripe': new Stripe(
      { 
        publishable_key: process.env.STRIPE_PUBLISHABLE_KEY, 
        secret_key: process.env.STRIPE_SECRET_KEY, 
        webhook_endpoint_secret: process.env.STRIPE_WEBHOOK_SECRET
      }
    )
  }
).on(
  'auth/signup',
  async (event) => {
    const user: Partial<AuthUserType> = event.payload;
    // Here you can send an onboarding email for example
  }
).on(
  'checkout/complete',
  async (event) => {
    const order_data: OrderData = event.payload;
    // Here send an email with order details to customer
  }
);

await app.init();
await migrateToLatest(app.db, false);
 
const server = http.createServer(app.handler).listen(
  8000,
  () => {
    console.log(`Server is running on http://localhost:8000`);
  }
);

```

Will produce

<div style="text-align:center">
  <img src='https://storecraft.app/docs/main/storecraft-terminal.png' 
      width='80%' />
</div><hr/><br/>


## packages

This is a mono repo, where each folder in the `packages` folder is a package, that is published `@npm`.

It leverages the workspace feature of `npm`

To start developing a feature first

```bash
npm install
```

The following is the layout of the packages

### Core ([@storecraft/core](packages/core/))

The core engine of storecraft
- core types
- core API
- core database types
- core crypto types
- core storage types
- core mailer types
- core payments types
- core platform types
- core VQL types and logic
- core REST API controller

### 🌐 Platforms [@storecraft/platforms](packages/platforms/)

Support for 
- Node
- Deno
- Bun
- Cloudflare workers
- AWS Lambda
- Azure Functions
- Google Functions

### 💾 Databases

Support for 
- MongoDB ([@storecraft/database-mongo-node](packages/database-mongodb-node/))
- SQL Base ([@storecraft/database-sql-base](packages/database-sql-base/))
  - Sqlite
  - Postgres
  - Mysql
- Neon (Cloud Postgres, [@storecraft/database-neon](packages/database-neon/))
- PlanetScale (Cloud Mysql, [@storecraft/database-planetscale](packages/database-planetscale/))
- Turso (Cloud Sqlite, [@storecraft/database-turso](packages/database-turso/))
- D1 (Cloud Sqlite, [@storecraft/database-cloudflare-d1](packages/database-cloudflare-d1/))

### 📦 Storage
Support for,
- Local storage (Node, Bun, Deno), [@storecraft/storage-local](packages/storage-local/)
- S3 Compatible ([@storecraft/storage-s3-compatible](packages/storage-s3-compatible/))
  - Cloudflare R2
  - AWS S3
  - DigitalOcean Spaces
  - MinIO
- Google Storage ([@storecraft/storage-google](packages/storage-google/))

### 📧 Email Providers
- node smtp support [@storecraft/mailer-smtp-node](packages/mailer-smtp-node/)
- Http Mail services [@storecraft/mailer-providers-http](packages/mailer-providers-http/) 
  - mailchimp support
  - mailgun support
  - resend support
  - sendgrid support

### 💳 Payments 

- Stripe [@storecraft/payments-stripe](packages/payments-stripe/)
- Paypal [@storecraft/payments-paypal](packages/payments-paypal/)
- You can roll your own (guide [here](https://storecraft.app/docs/backend/checkout-and-payments/roll-your-own))

### Dashboard

The official dashboard
- Learn how to use [here](https://storecraft.app/docs/dashboard/overview)
- The [code](packages/dashboard/), 
  - mount is as a component
  - consume from cdn

### sdks

- Universal (front/back) Javascript SDK, [@storecraft/sdk](packages/sdk/)
- React Hooks SDK, [@storecraft/sdk-react-hooks](packages/sdk-react-hooks/)

### Test Runner

Test your api with

[@storecraft/test-runner](packages/test-runner/) 

### docs

Docs website [code](packages/docs/)

### Examples Playground

[Here](packages/playground/) 


```text
Author: Tomer Shalev (tomer.shalev@gmail.com)
```
