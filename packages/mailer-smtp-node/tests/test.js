import 'dotenv/config';
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { MailerSmtpNode } from '../index.js';

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
)

test('send email', async () => {
  
  let { success, native_response } = await mailer.email({
    from: {name: 'bob 👻', address: process.env.FROM_EMAIL }, // sender address
    to: [ { address: process.env.TO_EMAIL } ], // list of receivers
    subject: 'nodemailer test', // Subject line
    text: 'nodemailer test text', // plain text body
    html: '<p>nodemailer test html</p>', // html body
  });

  assert.ok(success, `failed with native_response ${JSON.stringify(native_response, null, 2)}`)
  
});

test.run();
