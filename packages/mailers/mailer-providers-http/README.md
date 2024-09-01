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

> TODO: confirm tests

```bash
npm i @storecraft/mailer-providers-http
```

## Howto

### Sendgrid

```js
import { MailerSendGrid } from '@storecraft/mailer-providers-http/sendgrid';

const mailer = new MailerSendGrid(
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
import { MailerResend } from '@storecraft/mailer-providers-http/resend';

const mailer = new MailerResend(
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
import { MailerMailChimp } from '@storecraft/mailer-providers-http/mailchimp';

const mailer = new MailerMailChimp(
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
import { MailerMailgun } from '@storecraft/mailer-providers-http/mailgun';

const mailer = new MailerMailgun(
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


```text
Author: Tomer Shalev (tomer.shalev@gmail.com)
```