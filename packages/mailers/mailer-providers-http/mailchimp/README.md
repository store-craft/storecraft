# `mailchimp` mailer over http
[mailchimp.com](https://mailchimp.com/developer/transactional/api/messages/send-new-message/) client, that can work on eveywhere with `javascript`. We only rely on `fetch api`.

## Howto

```js
import { MailerMailChimp } from '@storecraft/mailer-mailchimp-http';

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

```text
Author: Tomer Shalev (tomer.shalev@gmail.com)
```