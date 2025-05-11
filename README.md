<div style="text-align:center">
  <div width="90%">
    <img src='https://github.com/store-craft/storecraft/blob/main/packages/docs/public/storecraft-color.svg' 
        width='100%' />
  </div>
  Agentic Commerce as Code Backend
</div><hr/><br/>


[![Core](https://github.com/store-craft/storecraft/actions/workflows/test.core.yml/badge.svg)](https://github.com/store-craft/storecraft/actions/workflows/test.core.yml)
[![MongoDB](https://github.com/store-craft/storecraft/actions/workflows/test.database-mongodb.yml/badge.svg)](https://github.com/store-craft/storecraft/actions/workflows/test.database-mongodb.yml)[![SQLite / Postgres / MySQL](https://github.com/store-craft/storecraft/actions/workflows/test.database-sql.yml/badge.svg)](https://github.com/store-craft/storecraft/actions/workflows/test.database-sql.yml)
[![S3 Compatible](https://github.com/store-craft/storecraft/actions/workflows/test.storage-s3-compatible.yml/badge.svg)](https://github.com/store-craft/storecraft/actions/workflows/test.storage-s3-compatible.yml)

[![what](https://img.shields.io/twitter/url?url=https%3A%2F%2Fx.com%2Fshalev_tomer&style=social&label=Storecraft)](https://x.com/shalev_tomer)
[![](https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin&link=https%3A%2F%2Fwww.linkedin.com%2Fcompany%2Fstore-craft
)](https://www.linkedin.com/company/store-craft)

# The <img src='https://github.com/store-craft/storecraft/blob/main/packages/docs/public/storecraft-color.svg' height='24px' style="transform: translateY(4px);" /> mono-repo

Hi 👋, `Storecraft` is an AI agentic next generation Commerce As Code javascript backend.

⭐ AI first, agentic, commerce as code with agents, chat endpoint, that can serve your customers, and your team.
Supports most of the popular LLMs, and vector stores for similarity search.

⭐ runs on any javascript [platform](https://storecraft.app/docs/backend/platforms/node) (deno, bun, node, cloudflare workers, aws-lambda, google-functions), serverless / serverful

⭐ connects to any [database](https://storecraft.app/docs/backend/databases/sqlite) (mongo, libsql, sqlite, postgres, mysql, neon, turso, d1, planetscale)

⭐ uses [storage](https://storecraft.app/docs/backend/storage/s3) (local, r2, s3 compatible, google and more)

⭐ It is [extensible and modular](https://storecraft.app/docs/backend/extensions/overview)

⭐ It is [event based](https://storecraft.app/docs/backend/events)

⭐ Boasts an official [Dashboard](https://storecraft.app/docs/dashboard/overview)

⭐ Well documented [REST-API](https://storecraft.app/docs/rest-api/api) (can also be found in your `/api/reference` endpoint)

<hr/>

## **GET STARTED WITH CLI NOW** 👇

```bash
npx storecraft create
```

This is all the code you need to get started with your own storecraft app.

```js
const app = new App({
  auth_admins_emails: ['tomer.shalev@gmail.com'],
  general_store_name: 'Wush Wush Games',
  // ... MORE Mandatory CONFIG
})
.withPlatform(new NodePlatform())
.withDatabase(new LibSQL())
.withStorage(new NodeLocalStorage('storage'))
.withMailer(new Resend())
.withPaymentGateways({
  paypal: new Paypal({ env: 'test' }),
  stripe: new Stripe(),
  dummy_payments: new DummyPayments(),
})
.withExtensions({
  postman: new PostmanExtension(),
})
.withAI(
  new OpenAI({ model: 'gpt-4o-mini'})
)
.withVectorStore(
  new LibSQLVectorStore({
    embedder: new OpenAIEmbedder(),
  })
)
.withAuthProviders({
  google: new GoogleAuth(),
})
.on(
  'order/checkout/complete',
  async (event) => {
    // send a team slack message
  }
).init();

await migrateToLatest(app._.db, false);
await app._.vector_store?.createVectorIndex();

http
.createServer(app.handler)
.listen(
  8000,
  () => {
    app.print_banner('http://localhost:8000');
  }
); 

```

**Will produce**

<div style='text-align: center'>
  <img src='https://storecraft.app/docs/storecraft-terminal-2.png' 
      width='100%' />
</div><hr/><br/>

# Chat with the `storeraft` AI agent

Located at `/chat`

<div style='text-align: center'>
  <img src='https://storecraft.app/landing/chat.png' 
      width='100%' />
</div><hr/><br/>


# Dashboard

Located at `/dashboard`

<div style='text-align: center'>
  <img src='https://storecraft.app/landing/main.png' 
      width='100%' />
</div><hr/><br/>

# API Reference

Located at `/api` (powered by [Scalar](https://scalar.com))


<div style='text-align: center'>
  <img src='https://storecraft.app/landing/reference_api.png' 
      width='100%' />
</div><hr/><br/>

# CLI (npx storecraft create)

<div style='text-align: center'>
  <img src='https://storecraft.app/cli.gif' 
      width='100%' />
</div><hr/><br/>

# As seen on MongoDB TV stream

[![Watch on Youtube](https://img.youtube.com/vi/OO4arXfO75U/0.jpg)](https://www.youtube.com/watch?v=OO4arXfO75U)


# Dvelopment

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
- Turso / Libsql (Local and Cloud Sqlite, [@storecraft/database-turso](https://github.com/store-craft/storecraft/tree/main/packages/databases/database-turso/))
- D1 (Cloud Sqlite, [@storecraft/database-cloudflare-d1](https://github.com/store-craft/storecraft/tree/main/packages/databases/database-cloudflare-d1/))

### 📦 Storage
Support for,
- Local storage (Node, Bun, Deno), [@storecraft/core/storage](https://github.com/store-craft/storecraft/tree/main/packages/core/storage/)
- S3 Compatible ([@storecraft/storage-s3-compatible](https://github.com/store-craft/storecraft/tree/main/packages/storage/storage-s3-compatible/))
  - Cloudflare R2
  - AWS S3
  - DigitalOcean Spaces
  - MinIO
- Google Storage ([@storecraft/storage-google](https://github.com/store-craft/storecraft/tree/main/packages/storage/storage-google/))

### 📧 Email Providers
- Http Mail services [@storecraft/mailer-providers-http](https://github.com/store-craft/storecraft/tree/main/packages/mailers/mailer-providers-http/) 
  - mailchimp support
  - mailgun support
  - resend support
  - sendgrid support
- node smtp support [@storecraft/mailer-smtp](https://github.com/store-craft/storecraft/tree/main/packages/mailers/mailer-smtp/)

### 💳 Payments 

- Stripe [@storecraft/payments-stripe](https://github.com/store-craft/storecraft/tree/main/packages/payments/payments-stripe/)
- Paypal [@storecraft/payments-paypal](https://github.com/store-craft/storecraft/tree/main/packages/payments/payments-paypal/)
- You can roll your own (guide [here](https://storecraft.app/docs/backend/checkout-and-payments/roll-your-own))

### Dashboard

The official dashboard
- Learn how to use [here](https://storecraft.app/docs/dashboard/overview)
- The [code](https://github.com/store-craft/storecraft/tree/main/packages/dashboard/), 
  - mount as a component, or
  - consume from cdn

### Chat

The official Chat
- Learn how to use [here](https://storecraft.app/docs/chat/overview)
- The [code](https://github.com/store-craft/storecraft/tree/main/packages/chat/), 
  - mount as a component, or
  - consume from cdn

### sdks

- Universal (front/back) Javascript SDK, [@storecraft/sdk](https://github.com/store-craft/storecraft/tree/main/packages/sdk/)
- React Hooks SDK, [@storecraft/sdk-react-hooks](https://github.com/store-craft/storecraft/tree/main/packages/sdk-react-hooks/)

### Test Runner

Test your app, database, storage and more integrations with

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

### Releasing

The source of truth for the versioning and publishing is the mono-repo version.
All the published packages are synced to the mono-repo version. Packages in
the mono-repo source code might have different versions but it doesn't matter
for the published packages.

#### Versioning

All versions are synced to the mono-repo version, and are published to npm.
Each of the commands:

```bash
npm run release:version:patch
npm run release:version:minor
npm run release:version:major
```

Will,

- Only update the version of the mono-repo.
- Add a git tag of the version.

#### Publishing

When running the command: 

```bash
npm run release:publish
```

It will,

- Update the version of all the packages in the mono-repo to the same version as the mono-repo.
- Publish all the packages to `npm` with the same version as the mono-repo.

> This can be done in a CI/CD pipeline, or manually.

```text
Author: Tomer Shalev (tomer.shalev@gmail.com)
```
