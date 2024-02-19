import { base64, jwt } from '@storecraft/core/v-crypto';

/**
 * 
 * @param {import('./types.public.js').ServiceFile} sf Google service account json
 * @param {string} [aud]
 * @returns 
 */
export async function getJWTFromServiceAccount(sf, aud=undefined) {
  /** @type {Partial<import('@storecraft/core/v-crypto/jwt.js').JWTClaims> & Record<string, string>} */
  const claims = {
    scope: [
      // 'https://www.googleapis.com/auth/cloud-platform',
      // 'https://www.googleapis.com/auth/firebase.database',
      // 'https://www.googleapis.com/auth/firebase.messaging',
      // 'https://www.googleapis.com/auth/identitytoolkit',
      // 'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/iam',
      'https://www.googleapis.com/auth/cloud-platform',
      'https://www.googleapis.com/auth/devstorage.full_control'
    ].join(' '),
    iss: sf.client_email,
    sub: sf.client_email,
  };

  if(aud) claims.aud=aud;

  const r = await jwt.create_with_pem(
    sf.private_key, 
    claims, 3600, 
    {
      kid: sf.private_key_id
    }
  );
  
  return r.token;
}

/**
 * Presign Google Storage resource
 * @param {{
 *  pem_private_key: string, 
 *  client_id_email: string, 
 *  gcs_api_endpoint: string, 
 *  path: string, 
 *  verb: string,
 *  content_md5?: string,
 *  content_type?: string,
 *  expiration_delta?: number,
 * }} signature
 */
export const presign = async ({pem_private_key, client_id_email, gcs_api_endpoint, 
  path, verb, content_md5 = '', content_type='', expiration_delta=3600 }) => {

  const expiration = Math.floor(Date.now()/1000) + expiration_delta;
  const digest = [
    verb, content_md5 ?? '', content_type ?? '', 
    expiration, path
  ].join('\n');

  const algorithm = {
    name: 'RSASSA-PKCS1-v1_5',
    hash: { name: 'SHA-256' },
  }
  // console.log(digest)
  const privateKey = await jwt.import_pem_pkcs8(pem_private_key, algorithm);
  const digest_buffer = new TextEncoder().encode(digest);
  const signature_buffer = await crypto.subtle.sign(
    algorithm,
    privateKey,
    digest_buffer
  );

  const signature_b64 = base64.fromUint8Array(new Uint8Array(signature_buffer));
  const qp = {
    'GoogleAccessId': client_id_email,
    'Expires': expiration.toString(),
    'Signature': signature_b64
  };
  const qp_string = new URLSearchParams(qp).toString();

  return`${gcs_api_endpoint}${path}?${qp_string}`;
}
