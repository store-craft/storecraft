# SendGrid mailer over http

## Howto

```js
import { MailerSmtpNode } from '@storecraft/mailer-sendgrid-http';

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

```txt
Author: Tomer Shalev (tomer.shalev@gmail.com)
```