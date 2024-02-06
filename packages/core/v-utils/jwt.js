// import {encode as bEnc, decode as bDec} from "https://deno.land/std/encoding/base64url.ts";
import { encodeURL, decode , btoa, fromUint8Array as bEnc, toUint8Array as bDec } from './base64.js'

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
  return claims
}

/**
 * @typedef {Object} JWTOptions
 * @prop {string} [alg='HS256'] the algorithm
 * 
 * @param {string} key 
 * @param {Partial<JWTClaims>} claims 
 * @param {number} expiresIn in seconds
 * @param {string} alg 
 * @returns {Promise<{ token: string, claims: Partial<JWTClaims>}>}
 */
export const create = async (key, claims, expiresIn=JWT_TIMES.HOUR, alg='HS256') => {
  const header = JSON.stringify({ alg, typ:"JWT"});
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