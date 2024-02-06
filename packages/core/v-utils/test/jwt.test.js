import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { verify, create, extractJWTClaims, JWT_TIMES } from '../jwt.js'

test('basic create and verify', async () => {
  const SECRET = 'secret'
  const jwt = await create(SECRET, { admin: true })
  const res1 = await verify(SECRET, jwt.token)
  const res2 = await verify(SECRET+SECRET, jwt.token)

  assert.is(res1.verified, true);
  assert.is(res2.verified, false);
});

test('parse claims', async () => {
  const SECRET = 'secret'
  const claims = {
    admin: true
  }
  const jwt = await create(SECRET, claims)
  const claims_re = extractJWTClaims(jwt.token)

  assert.equal(jwt.claims, claims_re);
});

test('verify claims expired', async () => {
  const SECRET = 'secret'
  const claims = {
    admin: true
  }

  const jwt_expired_1hr_ago = await create(SECRET, claims, -JWT_TIMES.HOUR)
  const verify1 = await verify(SECRET, jwt_expired_1hr_ago.token, true);
  const verify2 = await verify(SECRET, jwt_expired_1hr_ago.token, false);

  assert.is(verify1.verified, false);
  assert.is(verify2.verified, true);
});

test.run();