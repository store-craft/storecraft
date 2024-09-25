# SendGrid mailer over http
[sendgrid.com](https://docs.sendgrid.com/api-reference/mail-send/mail-send) client, that can work on eveywhere with `javascript`. We only rely on `fetch api`.

## Howto

```js
import { SendGrid } from '@storecraft/mailer-sendgrid-http';

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

```text
Author: Tomer Shalev (tomer.shalev@gmail.com)
```