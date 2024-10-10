<div style="text-align:center">
  <div width="90%">
    <img src='https://storecraft.app/storecraft-color.svg' 
        width='100%' />
  </div>
  Commerce as Code
</div><hr/><br/>

# The <img src='https://storecraft.app/storecraft-color.svg' height='24px' style="transform: translateY(4px);" /> mono-repo

Hi 👋, `Storecraft` is a next generation Commerce As Code javascript backend.

⭐ run on any javascript [platform](https://storecraft.app/docs/backend/platforms/node) (deno, bun, node, workers, aws-lambda, google-functions), serverless / serverful

⭐ connect to any [database](https://storecraft.app/docs/backend/databases/sqlite) (mongo, sqlite, postgres, mysql, neon, turso, d1, planetscale)

⭐ use [storage](https://storecraft.app/docs/backend/storage/s3) (local, r2, s3 compatible, google and more)

⭐ It is [extensible and modular](https://storecraft.app/docs/backend/extensions/overview)

⭐ It is [event based](https://storecraft.app/docs/backend/events)

⭐ Boasts an official [Dashboard](https://storecraft.app/docs/dashboard/overview)

⭐ Well documented [REST-API](https://storecraft.app/docs/rest-api/api) (can also be found in your `/api/reference` endpoint)

<hr/>

  

## **GET STARTED WITH CLI NOW** 👇

```bash
npx storecraft create
```

Storecraft emphesizes modular commerce as code to achieve business logic,

```js
import { App } from '@storecraft/core'
import { NodePlatform } from '@storecraft/core/platform/node'
import { MongoDB, migrateToLatest } from '@storecraft/database-mongodb'
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
  'orders/checkout/complete',
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

**Will produce**

<div style='text-align: center'>
  <img src='https://storecraft.app/docs/main/storecraft-terminal.png' 
      width='100%' />
</div><hr/><br/>

# Dashboard

Located at `/api/dashboard`

<div style='text-align: center'>
  <img src='https://storecraft.app/landing/main.webp' 
      width='100%' />
</div><hr/><br/>

# API Reference

Located at `/api/reference` (powered by [Scalar](scalar.com))


<div style='text-align: center'>
  <img src='https://storecraft.app/landing/reference_api.webp' 
      width='100%' />
</div><hr/><br/>

# CLI (npx storecraft create)

<div style='text-align: center'>
  <img src='https://storecraft.app/cli.gif' 
      width='100%' />
</div><hr/><br/>


# packages

This is a mono repo, where each folder in the `packages` folder is a package, that is published `@npm`.

It leverages the workspace feature of `npm`

To start developing a feature first

```bash
npm install
```

The following is the layout of the packages

### Core ([@storecraft/core](https://github.com/store-craft/storecraft/tree/main/packages/core/))

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

### 🌐 Platforms [@storecraft/core/platform](https://github.com/store-craft/storecraft/tree/main/packages/core/platform)

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
- MongoDB ([@storecraft/database-mongo-node](https://github.com/store-craft/storecraft/tree/main/packages/databases/database-mongodb/))
- SQLite ([@storecraft/database-sqlite](https://github.com/store-craft/storecraft/tree/main/packages/databases/database-sqlite/))
- Postgres ([@storecraft/database-postgres](https://github.com/store-craft/storecraft/tree/main/packages/databases/database-postgres/))
- MySQL ([@storecraft/database-mysql](https://github.com/store-craft/storecraft/tree/main/packages/databases/database-mysql/))
- SQL Base ([@storecraft/database-sql-base](https://github.com/store-craft/storecraft/tree/main/packages/databases/database-sql-base/))
- Neon (Cloud Postgres, [@storecraft/database-neon](https://github.com/store-craft/storecraft/tree/main/packages/databases/database-neon/))
- PlanetScale (Cloud Mysql, [@storecraft/database-planetscale](https://github.com/store-craft/storecraft/tree/main/packages/databases/database-planetscale/))
- Turso (Cloud Sqlite, [@storecraft/database-turso](https://github.com/store-craft/storecraft/tree/main/packages/databases/database-turso/))
- D1 (Cloud Sqlite, [@storecraft/database-cloudflare-d1](https://github.com/store-craft/storecraft/tree/main/packages/databases/database-cloudflare-d1/))

### 📦 Storage
Support for,
- Local storage (Node, Bun, Deno), [@storecraft/core/storage](https://github.com/store-craft/storecraft/tree/main/packages/storage/core/storage/)
- S3 Compatible ([@storecraft/storage-s3-compatible](https://github.com/store-craft/storecraft/tree/main/packages/storage/storage-s3-compatible/))
  - Cloudflare R2
  - AWS S3
  - DigitalOcean Spaces
  - MinIO
- Google Storage ([@storecraft/storage-google](https://github.com/store-craft/storecraft/tree/main/packages/storage/storage-google/))

### 📧 Email Providers
- node smtp support [@storecraft/mailer-smtp](https://github.com/store-craft/storecraft/tree/main/packages/mailers/mailer-smtp/)
- Http Mail services [@storecraft/mailer-providers-http](https://github.com/store-craft/storecraft/tree/main/packages/mailers/mailer-providers-http/) 
  - mailchimp support
  - mailgun support
  - resend support
  - sendgrid support

### 💳 Payments 

- Stripe [@storecraft/payments-stripe](https://github.com/store-craft/storecraft/tree/main/packages/payments/payments-stripe/)
- Paypal [@storecraft/payments-paypal](https://github.com/store-craft/storecraft/tree/main/packages/payments/payments-paypal/)
- You can roll your own (guide [here](backend/checkout-and-payments/roll-your-own))

### Dashboard

The official dashboard
- Learn how to use [here](dashboard/overview)
- The [code](https://github.com/store-craft/storecraft/tree/main/packages/dashboard/), 
  - mount is as a component
  - consume from cdn

### sdks

- Universal (front/back) Javascript SDK, [@storecraft/sdk](https://github.com/store-craft/storecraft/tree/main/packages/sdk/)
- React Hooks SDK, [@storecraft/sdk-react-hooks](https://github.com/store-craft/storecraft/tree/main/packages/sdk-react-hooks/)

### Test Runner

Test your app and database integrations with

[@storecraft/core/test-runner](https://github.com/store-craft/storecraft/tree/main/packages/core/test-runner/) 

### docs

Docs website [code](https://github.com/store-craft/storecraft/tree/main/packages/docs/)

### CLI

```bash
npx storecraft create
```

CLI [code](https://github.com/store-craft/storecraft/tree/main/packages/cli/)


### Examples Playground

[Here](https://github.com/store-craft/storecraft/tree/main/packages/playground/) 


```text
Author: Tomer Shalev (tomer.shalev@gmail.com)
```
