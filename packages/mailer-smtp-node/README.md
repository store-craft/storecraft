# SMTP proxy client for Node.js

## Features
- Send emails using a known smtp server
- uses `nodemailer` under the hood

## Howto

```js
import { MailerSmtpNode } from '@storecraft/mailer-smtp-node';

const mailer = new MailerSmtpNode(
  {
    host: "smtp.sendgrid.net",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: 'apikey', // generated ethereal user
      pass: process.env.SEND_GRID_SECRET, // generated ethereal password
    },  
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