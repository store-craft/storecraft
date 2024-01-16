import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { verify, hash } from '../crypto-pbkdf2.js'

test('hash and verify', async () => {
  const password = 'abcd1234'
  const hashed_password = await hash(password, 1000)
  const isVerified1 = await verify(hashed_password, password)
  const isVerified2 = await verify(hashed_password, 'abcd1235')

  assert.is(isVerified1, true);
  assert.is(isVerified2, false);
});


test.run();