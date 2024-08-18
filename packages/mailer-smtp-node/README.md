# SMTP proxy client for Node.js

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%'' />
</div><hr/><br/>

## Features
- Send emails using a known smtp server
- uses `nodemailer` under the hood

```bash
npm i @storecraft/mailer-smtp-node
```

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

```text
Author: Tomer Shalev (tomer.shalev@gmail.com)
```