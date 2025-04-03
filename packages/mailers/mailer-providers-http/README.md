# `storecraft` Official serverless http email providers

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%' />
</div><hr/><br/>

Supports wellknown http-based `serverless` friendly `email` providers,

- [Sendgrid](https://docs.sendgrid.com/api-reference/mail-send/mail-send)
- [Resend](https://resend.com/docs/api-reference/emails/send-email)
- [Mailchimp](https://mailchimp.com/developer/transactional/api/messages/send-new-message/)
- [Mailgun](https://documentation.mailgun.com/en/latest/api-sending.html#examples)

```bash
npm i @storecraft/mailer-providers-http
```

## Howto

### Sendgrid

```js
import { SendGrid } from '@storecraft/mailer-providers-http/sendgrid';

const mailer = new SendGrid(
  {
    apikey: process.env.SEND_GRID_SECRET
  }
);


let { success, native_response } = await mailer.email({
  from: {name: 'bob 👻', address: process.env.FROM_EMAIL }, // sender address
  to: [ { address: process.env.TO_EMAIL } ], // list of receivers
  subject: 'subject test', // Subject line
  text: 'plain text test', // plain text body
  html: '<p>html test</p>', // html body
});

```

### Resend
```js
import { Resend } from '@storecraft/mailer-providers-http/resend';

const mailer = new Resend(
  {
    apikey: process.env.RESEND_API_KEY
  }
);

let { success, native_response } = await mailer.email({
  from: {name: 'bob 👻', address: process.env.FROM_EMAIL }, // sender address
  to: [ { address: process.env.TO_EMAIL } ], // list of receivers
  subject: 'subject test', // Subject line
  text: 'plain text test', // plain text body
  html: '<p>html test</p>', // html body
});

```


### Mailchimp

```js
import { MailChimp } from '@storecraft/mailer-providers-http/mailchimp';

const mailer = new MailChimp(
  {
    apikey: process.env.MAILCHIMP_API_KEY
  }
);

let { success, native_response } = await mailer.email({
  from: {name: 'bob 👻', address: process.env.FROM_EMAIL }, // sender address
  to: [ { address: process.env.TO_EMAIL } ], // list of receivers
  subject: 'subject test', // Subject line
  text: 'plain text test', // plain text body
  html: '<p>html test</p>', // html body
});

```


### Mailgun

```js
import { Mailgun } from '@storecraft/mailer-providers-http/mailgun';

const mailer = new Mailgun(
  {
    apikey: process.env.MAILGUN_API_KEY
  }
);

let { success, native_response } = await mailer.email(
  {
    from: {name: 'bob 👻', address: process.env.FROM_EMAIL }, // sender address
    to: [ { address: process.env.TO_EMAIL } ], // list of receivers
    subject: 'subject test', // Subject line
    text: 'plain text test', // plain text body
    html: '<p>html test</p>', // html body
  }
);

```

## In Storecraft App

```js
import { App } from '@storecraft/core';
import { MongoDB, migrateToLatest } from '@storecraft/database-mongodb';
import { NodePlatform } from '@storecraft/core/platform/node';
import { GoogleStorage } from '@storecraft/storage-google';
import { SendGrid } from '@storecraft/mailer-providers-http/sendgrid';

const app = new App(config)
.withPlatform(new NodePlatform())
.withDatabase(new MongoDB())
.withStorage(new GoogleStorage())
.withMailer(
  new SendGrid(
    {
      apikey: process.env.SEND_GRID_SECRET
    }
  )
)

await app.init();
await migrateToLatest(app.db, false);

```

Storecraft will search the following `env` variables

```bash
MAILCHIMP_API_KEY=<key>
MAILGUN_API_KEY=<key>
RESEND_API_KEY=<key>
SENDGRID_API_KEY=<key>
```

So, you can instantiate with empty config

```ts
.withMailer(
  new SendGrid()
)
```

or, 

```ts
.withMailer(
  new Resend()
)
```
or, 

```ts
.withMailer(
  new MailChimp()
)
```

or,

```ts
.withMailer(
  new Mailgun()
)
```


```text
Author: Tomer Shalev (tomer.shalev@gmail.com)
```