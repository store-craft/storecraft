import 'dotenv/config';
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { Mailgun } from '../adapter.js';

const mailer = new Mailgun(
  {
      apikey: process.env.MAILGUN_API_KEY,
      domain_name: process.env.YOUR_DOMAIN_NAME
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

  assert.ok(
    success, 
    `failed with native_response ${JSON.stringify(native_response, null, 2)}`
  );
    
});

test.run();
