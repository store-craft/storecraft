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
import { App } from '@storecraft/core';
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
).init();
```

Storecraft will search the following `env` variables

```bash
SENDGRID_API_KEY=<key>
```

So, you can instantiate with empty config

```ts
.withMailer(
  new SendGrid()
)
```

### Resend
```js
import { App } from '@storecraft/core';
import { Resend } from '@storecraft/mailer-providers-http/resend';

const app = new App(config)
.withPlatform(new NodePlatform())
.withDatabase(new MongoDB())
.withStorage(new GoogleStorage())
.withMailer(
  new Resend(
    {
      apikey: process.env.RESEND_API_KEY
    }
  )
).init();
```

Storecraft will search the following `env` variables

```bash
RESEND_API_KEY=<key>
```

So, you can instantiate with empty config

```ts
.withMailer(
  new Resend()
)
```

### Mailchimp

```js
import { App } from '@storecraft/core';
import { MailChimp } from '@storecraft/mailer-providers-http/mailchimp';

const app = new App(config)
.withPlatform(new NodePlatform())
.withDatabase(new MongoDB())
.withStorage(new GoogleStorage())
.withMailer(
  new MailChimp(
    {
      apikey: process.env.MAILCHIMP_API_KEY
    }
  )
).init();

```
Storecraft will search the following `env` variables

```bash
MAILCHIMP_API_KEY=<key>
```

So, you can instantiate with empty config

```ts
.withMailer(
  new MailChimp()
)
```

### Mailgun

```js

import { App } from '@storecraft/core';
import { Mailgun } from '@storecraft/mailer-providers-http/mailgun';

const app = new App(config)
.withPlatform(new NodePlatform())
.withDatabase(new MongoDB())
.withStorage(new GoogleStorage())
.withMailer(
  new Mailgun(
    {
      apikey: process.env.MAILGUN_API_KEY
    }
  )
).init();
```

Storecraft will search the following `env` variables

```bash
MAILGUN_API_KEY=<key>
```

So, you can instantiate with empty config

```ts
.withMailer(
  new Mailgun()
)
```

```text
Author: Tomer Shalev (tomer.shalev@gmail.com)
```