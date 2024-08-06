<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       height='150px' />
</div><hr/><br/>

The `StoreCraft` mono-repo

```js
import { App } from '@storecraft/core'
import { NodePlatform } from '@storecraft/platform-node'
import { MongoDB } from '@storecraft/database-mongodb-node'
import { NodeLocalStorage } from '@storecraft/storage-node-local'
import { R2 } from '@storecraft/storage-s3-compatible'
import { GoogleStorage } from '@storecraft/storage-google'

let app = new App(
  new NodePlatform(),
  new MongoDB({db_name: 'test'}),
  // new NodeLocalStorage(join(homedir(), 'tomer'))
  // new R2(process.env.R2_BUCKET, process.env.R2_ACCOUNT_ID, process.env.R2_ACCESS_KEY_ID, process.env.R2_SECRET_ACCESS_KEY )
  new GoogleStorage()
);

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
- `@storecraft/platform-node` - platform support for **node.js**
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
- `@storecraft/storage-node-local` - local filesystem storage support on node
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
