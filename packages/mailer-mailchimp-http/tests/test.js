import 'dotenv/config';
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { MailerMailChimp } from '../index.js';

const mailer = new MailerMailChimp(
  {
      apikey: process.env.MAILCHIMP_API_KEY
  }
);

test('send email', async () => {
  
  let { success, native_response } = await mailer.email({
    from: {name: 'bob 👻', address: process.env.FROM_EMAIL }, // sender address
    to: [ { address: process.env.TO_EMAIL } ], // list of receivers
    subject: 'subject test', // Subject line
    text: 'plain text test', // plain text body
    html: '<p>html test</p>', // html body
  });

  assert.ok(success, `failed with native_response ${JSON.stringify(native_response, null, 2)}`)  
});

test.run();
