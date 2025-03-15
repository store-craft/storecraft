import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { verify, create, extractJWTClaims, JWT_TIMES, verify_RS256 } from '../jwt.js'

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



test('verify RS256', async () => {
  const token_rs256 = `eyJhbGciOiJSUzI1NiIsImtpZCI6IjkxNGZiOWIwODcxODBiYzAzMDMyODQ1MDBjNWY1NDBjNmQ0ZjVlMmYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIyODc0MDQ1MzQ0MjktNTJjbjhxdHFoNjBhaTkxdmJqZ2p1OTFzYXM0cDBqaW8uYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIyODc0MDQ1MzQ0MjktNTJjbjhxdHFoNjBhaTkxdmJqZ2p1OTFzYXM0cDBqaW8uYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDY3NzcwODgxMTQ4NjA1Njc1NDQiLCJlbWFpbCI6InRvbWVyLnNoYWxldkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6IjVmaDc3Z3Y3UUE1aHZOMXZIQmZIX2ciLCJuYW1lIjoiVG9tZXIgc2hhbGV2IiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0s1ZmNXU21TMTVkNERXSDlGWVZ1OV9DaHZoQ000dlJZdjY3QU5lZzhHSjdlbVlVQkQ5PXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6IlRvbWVyIiwiZmFtaWx5X25hbWUiOiJzaGFsZXYiLCJpYXQiOjE3NDE5NTM4OTEsImV4cCI6MTc0MTk1NzQ5MX0.r57PVwm_AUOdAsw3mGlkPTx2F-6etLyJm7cTQYUHhA6adlwrWbq6HDmqQlz5uLa3xVtijtctd2sWFVZ1MLw6LkEE5y9dq58ghm_Vs5O5HWYo9c2SyJj_4AsT-b4J0Akc9n9cKX7DITtBpVVJKuvcgs0HamMWtAIvW8SLW0heeeKfOAN3pYSaHynVqg2aVhPF2cWI8dwRTg2_ibNGeVWMENlzj1Ao_0V_yunKqIYf4k4csJ_UaT5OCJvsWp7UCZQ1FrVAmP0mmlIEWXvjT0Dd0Ar1YPdWgneUGJ3DmvZ_Qk4su5MLgJ-a7Lgp3aWcykqi2mz7lvVsksBMJMZZJdIQXw`

  const res1 = await verify_RS256(
    {
      "kty": "RSA",
      "n": "305hOVGLdm68E40mUPrxs02vabZGnsqOBEcKQWf4btOP0BWywIwQiRdGDQ3fx5f77HG5ZvZlnvVMkhFCLAGBXT7WeO37fHAKvSgTCN42iMC-x_GjlEuqq3rYP17dDjtiaaRjxQ5BvFgyMnQU5S_xS9m7GHNplVyX-tB53hPprUWzMYPMVBIsFMbN71KdHTF1u5ZqhyUMsIW0CtU-CfBLUF_i9UD8UcbUp0J9Ov7707vKMqve_o2E6ppjs5X8GrPDw2tIqqebPjE49DTK1aww6PiqC93a6o9PNlHm8W2mFx8Dq4MXe5yVIIfAOO0-YmbWc_H1DHlBG2Bu4Z73xOv0lQ",
      "e": "AQAB",
      "alg": "RS256",
      "use": "sig",
      // @ts-ignore
      "kid": "914fb9b087180bc0303284500c5f540c6d4f5e2f"
    }, token_rs256,
    false
  )

  assert.is(res1.verified, true);
});


test.run();