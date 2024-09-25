# Resend mailer over http
[Resend.com](https://resend.com/docs/api-reference/emails/send-email) client, that can work on eveywhere with `javascript`. We only rely on `fetch api`

## Howto

```js
import { Resend } from '@storecraft/mailer-resend-http';

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

```text
Author: Tomer Shalev (tomer.shalev@gmail.com)
```