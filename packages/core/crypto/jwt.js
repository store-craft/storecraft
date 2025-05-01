/**
 * @import { JWTClaims as JWTClaimsImport } from './jwt.types.js'
 */
import { fromUint8Array as bEnc, toUint8Array as bDec, 
  toUint8Array, encode, fromUint8Array } from './base64.js'
import { base64 } from './public.js';

/**
 * @typedef {JWTClaimsImport} JWTClaims
 */

/**
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
 * @template {Partial<JWTClaims> & Record<string, any>} [C=Partial<JWTClaims> & Record<string, any>]
 * Create a HS256 JWT with symmetric HMAC SHA256 secret
 * 
 * 
 * @param {string} key 
 * @param {C} claims 
 * @param {number} expiresIn in seconds
 * 
 * 
 * @returns {Promise<{ token: string, claims: C}>}
 */
export const create = async (
  key, claims, expiresIn=JWT_TIMES.HOUR
) => {

  const header = JSON.stringify({ alg: 'HS256', typ:"JWT"});
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
 * Create a RS256 JWT with asymmetric PEM private key PKCS #8 with RSA-256 hash 
 * @param {string} pem_private_key  
 * @param {Partial<JWTClaims>} claims 
 * @param {number} expiresIn in seconds
 * @param {Record<string, string>} extra_headers 
 * @returns {Promise<{ token: string, claims: Partial<JWTClaims>}>}
 */
export const create_with_pem = async (
  pem_private_key, claims, expiresIn=JWT_TIMES.HOUR, extra_headers={}
) => {
  const algorithm = {
    name: 'RSASSA-PKCS1-v1_5',
    hash: { name: 'SHA-256' },
  }

  const privateKey = await import_pem_pkcs8(
    pem_private_key, algorithm
  );
  
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
 * @template {JWTClaims} [CLAIMS=JWTClaims]
 * @param {string} jwt 
 * @returns {{header: Record<string, string>, claims: CLAIMS, signature: string}}
 */
export const parse_jwt = (jwt) => {
  const [
    b64_header, b64_claims, b64_signature
  ] = jwt.split('.');

  return{
    header: JSON.parse(base64.decode(b64_header)),
    claims: /** @type {CLAIMS} */ (JSON.parse(base64.decode(b64_claims))),
    signature: base64.decode(b64_signature),
  }
}

/**
 * Verify with Symetric HMAC-SHA256 (HS256) secret
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
    {
      name: 'HMAC'
    }, 
    await crypto.subtle.importKey(
      "raw", tEnc(key), 
      {
        name:"HMAC", hash:"SHA-256"
      }, 
      false, 
      ["sign", "verify"]
    ), 
    bDec(jwtParts[2]), 
    data
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


/**
 * Verify with Symetric RSA-SHA256 (RS256) secret
 * 
 * @param {JsonWebKey} json_web_key 
 * @param {string} jwt 
 * @param {boolean} verifyExpiration 
 * @returns {Promise<JWTVerifyResult>}
 */
export const verify_RS256 = async (json_web_key, jwt, verifyExpiration=true)=>{
  const jwtParts = jwt.split('.');
  if(jwtParts.length!==3) 
    return { verified: false };
  
  // const header = base64.decode(jwtParts[0]);
  const data = tEnc(jwtParts[0] + '.' + jwtParts[1]);

  let verified = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5", 
    await crypto.subtle.importKey(
      "jwk",
      json_web_key,
      {name: "RSASSA-PKCS1-v1_5", hash: "SHA-256"},
      true,
      ['verify']
    ), 
    bDec(jwtParts[2]), 
    data
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