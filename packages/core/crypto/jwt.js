import { fromUint8Array as bEnc, toUint8Array as bDec, 
  toUint8Array, encode, fromUint8Array } from './base64.js'

/**
 * @typedef {Object} JWTClaims
 * @prop {string} iss (issuer): Issuer of the JWT
 * @prop {string} sub (subject): Subject of the JWT (the user)
 * @prop {string} aud (audience): Recipient for which the JWT is intended
 * @prop {number} exp (expiration time): Time after which the JWT expires
 * @prop {number} nbf (not before time): Time before which the JWT must not be accepted for processing
 * @prop {number} iat (issued at time): Time at which the JWT was issued; can be used to determine age of the JWT
 * @prop {string} jti (JWT ID): Unique identifier; can be used to prevent the JWT from being replayed (allows a token to be used only once)
 */

/**
 * 
 * @param {string} d 
 * @returns 
 */
const tEnc = (d) => new TextEncoder().encode(d);
/**
 * 
 * @param {Uint8Array} d 
 * @returns 
 */
const tDec = (d) => new TextDecoder().decode(d);

/**
 * 
 * @param {string} k 
 * @returns {Promise<CryptoKey>}
 */
const genKey = (k) => {
  return crypto.subtle.importKey(
    "raw", tEnc(k), {
      name:"HMAC", hash:"SHA-256"
    }, false, ["sign", "verify"]
  );
}

const _s = 1;
const _m = _s * 60;
const _h = _m * 60;
const _d = _h * 24;
const _w = _d * 7;
const _y = Math.floor(_d * 365.25);

export const JWT_TIMES = {
  SECOND: _s,
  MINUTE: _m,
  HOUR: _h,
  DAY: _d,
  WEEK: _w,
  YEAR: _y,
}

const now_seconds = () => Math.floor(Date.now()/1000);

/**
 * 
 * @param {Partial<JWTClaims>} claims 
 */
const fill_claims = (claims, expireIn=JWT_TIMES.HOUR) => {
  claims.iat = now_seconds()
  claims.exp = claims.iat + expireIn;
  // console.log('claims', claims)
  return claims
}

/**
 * @typedef {Object} JWTOptions
 * @prop {string} [alg='HS256'] the algorithm
 */

/**
 * 
 * Create a JWT with symmetric HMAC secret
 * 
 * 
 * @param {string} key 
 * @param {Partial<JWTClaims>} claims 
 * @param {number} expiresIn in seconds
 * @param {string} alg 
 * @param {Record<string, string>} extra_headers 
 * 
 * 
 * @returns {Promise<{ token: string, claims: Partial<JWTClaims>}>}
 */
export const create = async (
  key, claims, expiresIn=JWT_TIMES.HOUR, alg='HS256', extra_headers={}
) => {

  const header = JSON.stringify({ alg, typ:"JWT", ...extra_headers});
  const payload_header = bEnc(tEnc(header), true);
  const payload_claims = bEnc(tEnc(JSON.stringify(fill_claims(claims, expiresIn))), true);
  const payload = `${payload_header}.${payload_claims}`;

  const signature = bEnc(
    new Uint8Array(
      await crypto.subtle.sign(
        {
          name:"HMAC"
        }, 
        await genKey(key), tEnc(payload)
      )
    ), true
  );

  return {
    token: `${payload}.${signature}`,
    claims
  };
};

/**
 * 
 * @param {string} pem 
 * @param {any} algorithm 
 */
export const import_pem_pkcs8 = (pem, algorithm) => {
  const pemHeader = '-----BEGIN PRIVATE KEY-----';
  const pemFooter = '-----END PRIVATE KEY-----';

  pem = pem.replace(/\n/g, '');

  if (!pem.startsWith(pemHeader) || !pem.endsWith(pemFooter)) {
      throw new Error('Invalid service account private key')
  }

  pem = pem.substring(pemHeader.length, pem.length - pemFooter.length);
  const buffer = toUint8Array(pem);

  return crypto.subtle.importKey('pkcs8', buffer, algorithm, false, ['sign'])
}

/**
 * 
 * Create a JWT with asymmetric PEM private key PKCS #8 with RSA-256 hash 
 * @param {string} pem_private_key  
 * @param {Partial<JWTClaims>} claims 
 * @param {number} expiresIn in seconds
 * @param {Record<string, string>} extra_headers 
 * @returns {Promise<{ token: string, claims: Partial<JWTClaims>}>}
 */
export const create_with_pem = async (pem_private_key, claims, expiresIn=JWT_TIMES.HOUR, extra_headers={}) => {
  const algorithm = {
    name: 'RSASSA-PKCS1-v1_5',
    hash: { name: 'SHA-256' },
  }

  const privateKey = await import_pem_pkcs8(pem_private_key, algorithm);
  
  const header = encode(
    JSON.stringify({
      alg: 'RS256',
      typ: 'JWT',
      ...extra_headers,
    }), true
  )
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + expiresIn;
  
  claims = { exp, iat, ...claims };
  const payload = encode(
    JSON.stringify(claims), true
  );

  const textEncoder = new TextEncoder()
  const inputArrayBuffer = textEncoder.encode(`${header}.${payload}`)

  const outputArrayBuffer = await crypto.subtle.sign(
    algorithm,
    privateKey,
    inputArrayBuffer
  );

  const signature = fromUint8Array(new Uint8Array(outputArrayBuffer), true);
  const token = `${header}.${payload}.${signature}`;
  return { token, claims }
}

/**
 * 
 * @param {string} jwt 
 * @returns {Partial<JWTClaims>}
 */
export const extractJWTClaims = (jwt) => {
  const jwtParts = jwt.split('.');
  if(jwtParts.length!==3) 
    return {};

  return JSON.parse(tDec(bDec(jwtParts[1])));
}

/**
 * Verify with Symetric HMAC secret
 * @typedef {object} JWTVerifyResult
 * @prop {boolean} verified
 * @prop {Partial<JWTClaims> | undefined} [claims]
 * 
 * @param {string} key 
 * @param {string} jwt 
 * @param {boolean} verifyExpiration 
 * @returns {Promise<JWTVerifyResult>}
 */
export const verify = async (key, jwt, verifyExpiration=true)=>{
  const jwtParts = jwt.split('.');

  if(jwtParts.length!==3) 
    return { verified: false };

  const data = tEnc(jwtParts[0] + '.' + jwtParts[1]);

  let verified = await crypto.subtle.verify(
    {name:"HMAC"}, await genKey(key), bDec(jwtParts[2]), data
  )

  let claims = verified ? extractJWTClaims(jwt) : undefined

  if(verifyExpiration && claims) {
    verified = verified && claims?.exp && (claims?.exp > now_seconds())
  }

  return {
    verified,
    claims
  }
};