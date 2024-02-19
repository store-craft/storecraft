# `mailgun` mailer over http
[mailgun.com](https://documentation.mailgun.com/en/latest/api-sending.html#examples) client, that can work on eveywhere with `javascript`. We only rely on `fetch api`.

## Howto

```js
import { MailerMailChimp } from '@storecraft/mailer-mailgun-http';

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

```txt
Author: Tomer Shalev (tomer.shalev@gmail.com)
```