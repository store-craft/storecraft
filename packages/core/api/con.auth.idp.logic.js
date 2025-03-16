/**
 * @import { 
 *  ApiAuthResult,
 *  OAuthProviderCreateURIParams, SignWithOAuthProviderParams, 
 *  OAuthProviderCreateURIResponse
 * } from './types.api.js';
 * @import { JWTClaims } from '../crypto/jwt.js'
 */
import * as jwt from '../crypto/jwt.js'
import { ID, assert } from './utils.func.js'
import { App } from '../index.js'
import { 
  isAdminEmail, sanitize_auth_user, upsert_auth_user 
} from './con.auth.logic.js'

export const ATTRIBUTE_OAUTH_PROVIDER = 'OAUTH_PROVIDER'
export const ATTRIBUTE_PICTURE = 'PICTURE'

// /**
//  * 
//  * @param {App} app 
//  * @returns 
//  */
// const providers = app => {
//   /**
//    * https://developers.google.com/identity/protocols/oauth2/web-server#httprest
//    * https://cloud.google.com/docs/authentication/token-types
//    * https://developers.google.com/identity/sign-in/web/backend-auth
//    */
//   return {
//     google: {
//       client_id: String(app.platform.env.IDP_GOOGLE_CLIENT_ID),
//       client_secret: String(app.platform.env.IDP_GOOGLE_CLIENT_SECRET),
//       scopes: [
//         "https://www.googleapis.com/auth/userinfo.email",
//         "https://www.googleapis.com/auth/userinfo.profile",
//       ],
//       authorization_url: 'https://accounts.google.com/o/oauth2/v2/auth',
//       token_url: 'https://oauth2.googleapis.com/token',
//       validate_url: 'https://oauth2.googleapis.com/tokeninfo',
//       name: 'Google',
//       logo_url: `data:image/svg+xml;charset=utf-8,<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlns:xlink="http://www.w3.org/1999/xlink" style="display: block;"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>`,
//       description: undefined,
//       webapp_consent_uri(redirect_uri='', extra=undefined) {
//         const scopes = this.scopes.join(" ");
//         const state = "some_state";
//         return `${this.authorization_url}?client_id=${this.client_id}&redirect_uri=${redirect_uri}&access_type=offline&response_type=code&state=${state}&scope=${scopes}`;
//       },
//       /**
//        * 
//        * @param {SignWithOAuthProviderParams} params 
//        */
//       async sign_with_authorization_response(params) {
//         assert(
//           params?.authorization_response?.code,
//           `sign_with_authorization_response:: No \`code\` property found for provider ${params.provider}`
//         )
//         /** @type {import('./con.auth.idp.types.js').exchange_authorization_for_token_body} */
//         const data = {
//           ...params.authorization_response,
//           code: params.authorization_response.code,
//           client_id: this.client_id,
//           client_secret: this.client_secret,
//           redirect_uri: params.redirect_uri,
//           grant_type: 'authorization_code',
//         };
    
//         // console.log(data);
    
//         // exchange authorization code for access token & id_token
    
//         const response = await fetch(
//           this.token_url, {
//           method: 'POST',
//           body: JSON.stringify(data),
//         });

//         /** @type {import('./con.auth.idp.types.js').exchange_authorization_for_token_response} */
//         const json = await response.json();
//         // console.log('sign_with_authorization_response:: ', json)
//         assert(
//           response.ok,
//           json
//         );

//         { // validate id-token, we can do it in house but we need the
//           // public google certs, so we alway need a fetch call
//           const response = await fetch(
//             this.validate_url + '?id_token=' + json.id_token
//           );

//           /** @type {import('./con.auth.idp.types.js').token_info_response} */
//           const claims = await response.json();

//           assert(
//             response.ok,
//             claims
//           );

//           return {
//             email: claims.email,
//             firstname: claims.given_name,
//             lastname: claims.family_name,
//             picture: claims.picture,
//           }
//         }
//       }
//     },

//     // https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow/
//     facebook: {
//       app_id: String(app.platform.env.IDP_FACEBOOK_APP_ID),
//       app_secret: String(app.platform.env.IDP_FACEBOOK_APP_SECRET),
//       scopes: [
//         'email',
//         'public_profile',
//       ],
//       authorization_url: 'https://www.facebook.com/v22.0/dialog/oauth',
//       token_url: 'https://graph.facebook.com/v22.0/oauth/access_token',
//       name: 'Facebook',
//       logo_url: `data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" version="1.1" id="svg9" width="666.66669" height="666.66718" viewBox="0 0 666.66668 666.66717"><defs id="defs13"><clipPath clipPathUnits="userSpaceOnUse" id="clipPath25"><path d="M 0,700 H 700 V 0 H 0 Z" id="path23"/></clipPath></defs><g id="g17" transform="matrix(1.3333333,0,0,-1.3333333,-133.33333,799.99999)"><g id="g19"><g id="g21" clip-path="url(#clipPath25)"><g id="g27" transform="translate(600,350)"><path d="m 0,0 c 0,138.071 -111.929,250 -250,250 -138.071,0 -250,-111.929 -250,-250 0,-117.245 80.715,-215.622 189.606,-242.638 v 166.242 h -51.552 V 0 h 51.552 v 32.919 c 0,85.092 38.508,124.532 122.048,124.532 15.838,0 43.167,-3.105 54.347,-6.211 V 81.986 c -5.901,0.621 -16.149,0.932 -28.882,0.932 -40.993,0 -56.832,-15.528 -56.832,-55.9 V 0 h 81.659 l -14.028,-76.396 h -67.631 V -248.169 C -95.927,-233.218 0,-127.818 0,0" style="fill:#0866ff;fill-opacity:1;fill-rule:nonzero;stroke:none" id="path29"/></g><g id="g31" transform="translate(447.9175,273.6036)"><path d="M 0,0 14.029,76.396 H -67.63 v 27.019 c 0,40.372 15.838,55.899 56.831,55.899 12.733,0 22.981,-0.31 28.882,-0.931 v 69.253 c -11.18,3.106 -38.509,6.212 -54.347,6.212 -83.539,0 -122.048,-39.441 -122.048,-124.533 V 76.396 h -51.552 V 0 h 51.552 v -166.242 c 19.343,-4.798 39.568,-7.362 60.394,-7.362 10.254,0 20.358,0.632 30.288,1.831 L -67.63,0 Z" style="fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:none" id="path33"/></g></g></g></g></svg>`,
//       description: undefined,
//       webapp_consent_uri(redirect_uri='', extra=undefined) {
//         const params = new URLSearchParams(
//           {
//             client_id: this.app_id,
//             redirect_uri,
//             access_type: 'offline',
//             response_type: 'code',
//             scope: this.scopes.join(", ")
//           }
//         ).toString();
//         return `${this.authorization_url}?${params}`;
//       },
//       /**
//        * 
//        * @param {SignWithOAuthProviderParams} params 
//        */
//       async sign_with_authorization_response(params) {
//         assert(
//           params?.authorization_response?.code,
//           `sign_with_authorization_response:: No \`code\` property found for provider ${params.provider}`
//         )
//         const data = {
//           ...params.authorization_response,
//           code: params.authorization_response.code,
//           client_id: this.app_id,
//           client_secret: this.app_secret,
//           redirect_uri: params.redirect_uri,
//         };
    
//         // console.log({data});
    
//         // exchange authorization code for access token & id_token
//         const search_params = new URLSearchParams(data).toString();
//         const response = await fetch(
//           this.token_url + `?` + search_params, {
//           method: 'get',
//         });

//         /** @type {{id_token: string, access_token: string, token_type: string, expires_in: number}} */
//         const json = await response.json();
//         // console.log('sign_with_authorization_response:: ', json)

//         assert(
//           response.ok,
//           json
//         );

//         { 
//           // console.log({json})

//           const { claims } = jwt.parse_jwt(json.id_token);
//           const cast_claims = /** @type {import('./con.auth.idp.types.js').OAuthClaims} */ (claims);

//           return {
//             email: cast_claims.email,
//             firstname: cast_claims.given_name,
//             lastname: cast_claims.family_name,
//             picture: cast_claims.picture,
//           }
//         }
//       }
//     },


//     github: {
//       app_id: String(app.platform.env.IDP_GITHUB_CLIENT_ID),
//       app_secret: String(app.platform.env.IDP_GITHUB_CLIENT_SECRET),
//       scopes: [
//         'read:user',
//         'user:email',
//       ],
//       authorization_url: 'https://github.com/login/oauth/authorize',
//       token_url: 'https://github.com/login/oauth/access_token',
//       name: 'Github',
//       logo_url: `data:image/svg+xml;charset=utf-8,<svg stroke="currentColor" fill="white" stroke-width="0" viewBox="0 0 496 512" height="200px" width="200px" xmlns="http://www.w3.org/2000/svg"><path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"></path></svg>`,
//       description: undefined,
//       webapp_consent_uri(redirect_uri='', extra=undefined) {
//         const params = new URLSearchParams(
//           {
//             client_id: this.app_id,
//             redirect_uri,
//             access_type: 'offline',
//             response_type: 'code',
//             scope: this.scopes.join(" ")
//           }
//         ).toString();
//         return `${this.authorization_url}?${params}`;
//       },
//       /**
//        * 
//        * @param {SignWithOAuthProviderParams} params 
//        */
//       async sign_with_authorization_response(params) {
//         assert(
//           params?.authorization_response?.code,
//           `sign_with_authorization_response:: No \`code\` property found for provider ${params.provider}`
//         )
//         const data = {
//           ...params.authorization_response,
//           code: params.authorization_response.code,
//           client_id: this.app_id,
//           client_secret: this.app_secret,
//           redirect_uri: params.redirect_uri,
//         };
    
//         // console.log({data});
    
//         // exchange authorization code for access token & id_token
//         const search_params = new URLSearchParams(data).toString();
//         const response = await fetch(
//           this.token_url + `?` + search_params, {
//           method: 'get',
//         });

//         const json = await response.formData();
//         /** @type {{access_token: string, token_type: string, expires_in: number}} */
//         const obj = Object.fromEntries(json)

//         /** @type {{name: string, email: string, avatar_url: string}} */
//         const user = await fetch(
//           'https://api.github.com/user',
//           {
//             headers: {
//               'Authorization': 'Bearer ' + obj.access_token
//             }
//           }
//         ).then(res => res.json());
        
//         assert(
//           response.ok,
//           obj
//         );

//         { 
//           // console.log({json})

//           return {
//             email: user.email,
//             firstname: user.name.split(' ').at(0).trim(),
//             lastname: user.name.split(' ').at(1).trim(),
//             picture: user.avatar_url,
//           }
//         }
//       }
//     },

//     // https://x.com/i/oauth2/authorize?client_id=ci1sTW5MZXFOX1NWSFZ2YUNJd0Y6MTpjaQ&redirect_uri=http%3A%2F%2Flocalhost%3A5174%3Fprovider%3Dx&access_type=offline&response_type=code&scope=user%3Aemail&code_challenge_method=S256&code_challenge=OmKU2j0GgOVrnKR6xnDc3wWkG76plgn9bIsCmmQymaE&state=state
//     // https://docs.x.com/resources/fundamentals/authentication/guides/log-in-with-x#implementing-log-in-with-x
//     // https://docs.x.com/resources/fundamentals/authentication/oauth-2-0/user-access-token
//     x: {
//       consumer_api_key: String(app.platform.env.IDP_X_CONSUMER_API_KEY),
//       consumer_api_secret: String(app.platform.env.IDP_X_CONSUMER_API_SECRET),
//       scopes: [
//         // 'users.read',
//         // 'tweet.read'
//         'read:user',
//         'user:email',
//       ],
//       authorization_url: 'https://x.com/i/oauth2/authorize',
//       token_url: 'https://api.x.com/2/oauth2/token',
//       name: 'X',
//       logo_url: `data:image/svg+xml;charset=utf-8,<svg fill="white" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" ><g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></g></svg>`,
//       description: undefined,
//       async webapp_consent_uri(redirect_uri='', extra=undefined) {
//         const strictUriEncode = string => encodeURIComponent(string).replaceAll(/[!'()*]/g, x => `%${x.charCodeAt(0).toString(16).toUpperCase()}`);

//         // const { code_challenge, code_verifier } = await pkceChallenge();
//         // // https://x.com/i/oauth2/authorize?response_type=code&client_id=M1M5R3BMVy13QmpScXkzTUt5OE46MTpjaQ&redirect_uri=https://www.example.com&scope=tweet.read%20users.read%20follows.read%20offline.access&state=state&code_challenge=challenge&code_challenge_method=plain
//         // // const params = new URLSearchParams(
//         // const params = new URLSearchParams(
//         //   {
//         //     client_id: this.client_id,
//         //     redirect_uri: redirect_uri,
//         //     response_type: 'code',
//         //     scope: this.scopes.join(' ').trim(),
//         //     code_challenge_method: 's256',
//         //     code_challenge: code_challenge,
//         //     state: code_verifier 
//         //   }
//         // ).toString();
//         // return `${this.authorization_url}?${params}`;
//         const oauth = new OAuth({
//           consumer: {
//             key: this.consumer_api_key,
//             secret: this.consumer_api_secret
//           },
//           signature_method: 'HMAC-SHA1',
//           async hash_function(baseString, key) {
//             // encoder to convert string to Uint8Array
//             var enc = new TextEncoder();
        
//             const cryptKey = await crypto.subtle.importKey(
//               'raw',
//               enc.encode(key),
//               { name: 'HMAC', hash: 'SHA-1' },
//               false,
//               ['sign', 'verify'],
//             )
        
//             const signature = await crypto.subtle.sign(
//               { name: 'HMAC', hash: 'SHA-1' },
//               cryptKey,
//               enc.encode(baseString)
//             )
        
//             let b = new Uint8Array(signature);
//             // base64 digest
//             return base64.fromUint8Array(b);
//           }
//         })
        
//         const auth = await oauth.authorize(
//           {
//             method: 'POST',
//             url: 'https://api.x.com/oauth/request_token',
//             data: {
//               oauth_callback: redirect_uri
//             }
//           },
//           // {
//           //   key: this.options.accessToken,
//           //   secret: this.options.tokenSecret
//           // }
//         );

//         const auth_header = oauth.toHeader(auth);
//         console.log({auth_header});

//         const response = await fetch(
//           'https://api.x.com/oauth/request_token',
//           {
//             method: 'POST',
//             headers: {
//               ...auth_header
//             }
//           }
//         );
        
//         await assert_async(
//           response.ok,
//           () => response.json()
//         );

//         // console.log({response})

//         const obj_text = await response.text();
//         /** @type {{oauth_token: string, oauth_callback_confirmed: string, oauth_token_secret: string}} */
//         const obj = Object.fromEntries(new URLSearchParams(obj_text));

//         assert(
//           obj.oauth_callback_confirmed,
//           obj
//         );

//         return `https://api.x.com/oauth/authorize?oauth_token=${obj.oauth_token}`
//       },
//       /**
//        * 
//        * @param {SignWithOAuthProviderParams} params 
//        */
//       async sign_with_authorization_response(params) {
//         // const strictUriEncode = string => encodeURIComponent(string).replaceAll(/[!'()*]/g, x => `%${x.charCodeAt(0).toString(16).toUpperCase()}`);
//         const data = {
//           oauth_verifier: params.authorization_response.oauth_verifier,
//           oauth_token: params.authorization_response.oauth_token,
//         };
    
//         const oauth = new OAuth({
//           consumer: {
//             key: this.consumer_api_key,
//             secret: this.consumer_api_secret
//           },
//           signature_method: 'HMAC-SHA1',
//           async hash_function(baseString, key) {
//             // encoder to convert string to Uint8Array
//             var enc = new TextEncoder();
        
//             const cryptKey = await crypto.subtle.importKey(
//               'raw',
//               enc.encode(key),
//               { name: 'HMAC', hash: 'SHA-1' },
//               false,
//               ['sign', 'verify'],
//             )
        
//             const signature = await crypto.subtle.sign(
//               { name: 'HMAC', hash: 'SHA-1' },
//               cryptKey,
//               enc.encode(baseString)
//             )
        
//             let b = new Uint8Array(signature);
//             // base64 digest
//             return base64.fromUint8Array(b);
//           }
//         })
        
//         const auth = await oauth.authorize(
//           {
//             method: 'POST',
//             url: 'https://api.x.com/oauth/access_token',
//             data: {
//               // oauth_token: data.oauth_token,
//               oauth_verifier: data.oauth_verifier,
//             }
//           }, {
//             key: data.oauth_token,
//             secret: undefined
//           }
//         );


//         const auth_header = oauth.toHeader(auth);
//         // console.log({auth_header});

//         const response = await fetch(
//           'https://api.x.com/oauth/access_token',
//           {
//             method: 'POST',
//             headers: {
//               ...auth_header,
//               'Content-Type': 'application/x-www-form-urlencoded'
//             },
//             body: (new URLSearchParams(
//               {
//                 oauth_verifier: data.oauth_verifier,
//                 // oauth_token: data.oauth_token,
//                 // oauth_consumer_key: this.consumer_app_key
//               }
//             )).toString()
//           }
//         );

//         await assert_async(
//           response.ok,
//           () => response.text()
//         );

//         const response_text = await response.text();
//         /** @type {{oauth_token: string, oauth_token_secret: string}} */
//         const response_obj = Object.fromEntries(new URLSearchParams(response_text));

//         // console.log({response_obj})
//         {
//           // now get the credentials with v1
//           // /1.1/account/verify_credentials.json
//           const oauth = new OAuth({
//             consumer: {
//               key: this.consumer_api_key,
//               secret: this.consumer_api_secret
//             },
//             signature_method: 'HMAC-SHA1',
//             async hash_function(baseString, key) {
//               // encoder to convert string to Uint8Array
//               var enc = new TextEncoder();
          
//               const cryptKey = await crypto.subtle.importKey(
//                 'raw',
//                 enc.encode(key),
//                 { name: 'HMAC', hash: 'SHA-1' },
//                 false,
//                 ['sign', 'verify'],
//               )
          
//               const signature = await crypto.subtle.sign(
//                 { name: 'HMAC', hash: 'SHA-1' },
//                 cryptKey,
//                 enc.encode(baseString)
//               )
          
//               let b = new Uint8Array(signature);
//               // base64 digest
//               return base64.fromUint8Array(b);
//             }
//           });

//           const auth = await oauth.authorize(
//             {
//               method: 'GET',
//               url: 'https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true',
//               // data: {
//               //   // oauth_token: response_obj.oauth_token,
//               //   // oauth_token_secret: response_obj.oauth_token_secret
//               // }
//             }, {
//               key: response_obj.oauth_token,
//               secret: response_obj.oauth_token_secret,
//             }
//           );

//           const auth_header = oauth.toHeader(auth);
//           console.log({auth_header})

//           // https://developer.x.com/en/docs/x-api/v1/accounts-and-users/manage-account-settings/api-reference/get-account-verify_credentials
//           const response = await fetch(
//             'https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true',
//             {
//               method: 'GET',
//               headers: {
//                 ...auth_header,
//               },
//             }
//           );

//           // console.log({response})

//           await assert_async(
//             response.ok,
//             () => response.json()
//           );

//           /** @type {{name: string, email: string, profile_image_url: string}} */
//           const user = await response.json();

//           console.log({user})

//           return {
//             email: user.email,
//             firstname: user.name.split(' ').at(0).trim(),
//             lastname: user.name.split(' ').at(1)?.trim() ?? '',
//             picture: user.profile_image_url,
//           }
//         }

//       }

//     },
    

//   }  
// }

/**
 * @description Get Identity provider's URI for web apps
 * 
 * @param {App} app 
 */  
export const create_auth_uri = (app) => 
  /**
   * @description Get Identity provider's URI for web apps
   * @param {OAuthProviderCreateURIParams} params 
   * @returns {Promise<OAuthProviderCreateURIResponse>}
   */
  async (params) => {

    const provider = app.auth_providers?.[params?.provider];

    assert(
      provider,
      `Identity Provider ${params.provider} not found`
    );

    const uri = await provider.generateAuthUri(
      params.redirect_uri, params.extra_parameters
    );
    // console.log({uri})
    assert(
      uri,
      `Identity Provider ${params.provider} does not have a web consent uri`
    );

    return {
      uri,
      provider: params.provider
    }
  
  }
    
/**
 * @description Signin / Signup with Identity Provider
 * 
 * @param {App} app 
 */  
export const sign_with_identity_provider = (app) => 
  /**
   * @description Signin / Signup with Identity Provider
   * 
   * @param {SignWithOAuthProviderParams} params 
   * 
   * @returns {Promise<ApiAuthResult>}
   */
  async (params) => {

    const provider = app.auth_providers?.[params?.provider];
    
    assert(
      provider,
      `Identity Provider ${params.provider} not found`
    );

    const response = await provider.signWithAuthorizationResponse(
      {
        redirect_uri: params.redirect_uri,
        authorization_response: params.authorization_response
      }
    );

    // console.log('params', params)
    // console.log('response', response)

    {
      const {
        email, firstname, lastname, picture
      } = response;

      const roles = isAdminEmail(app, email) ? ['admin'] : ['user'];
      let user = await app.api.auth.get_auth_user(email);
      let is_new_user = !Boolean(user)

      // upsert new
      if(is_new_user) {
        user = {
          id: ID('au'),
          email, 
          active: true,
          password: undefined,
          confirmed_mail: true,
          description: `This user is a created with roles: ${roles.join(', ')}`,
          firstname,
          lastname,
          attributes: [
            {
              key: ATTRIBUTE_OAUTH_PROVIDER,
              value: params.provider
            },
            {
              key: ATTRIBUTE_PICTURE,
              value: picture
            },
            {
              key: 'firstname',
              value: firstname?.slice(0, 20)
            },
            {
              key: 'lastname',
              value: lastname?.slice(0, 20)
            },
          ]
        }

        const success = await upsert_auth_user(app)(
          user
        );

        if(success) {
          // optional, but we set up a customer record directly into database
          // to avoid confusions
          await app.api.customers.upsert(
            {
              email: user.email,
              auth_id: user.id,
              id: 'cus_' + user.id.split('_')?.at(-1),
              firstname: firstname,
              lastname: lastname
            }
          );
        }
      }

      // issue tokens

      /** @type {Partial<JWTClaims>} */
      const claims = {
        sub: user.id, 
        // @ts-ignore
        roles,
        firstname: firstname,
        lastname: lastname,
        email: email
      };

      const access_token = await jwt.create(
        app.config.auth_secret_access_token,
        claims, jwt.JWT_TIMES.HOUR
      );

      const refresh_token = await jwt.create(
        app.config.auth_secret_refresh_token, 
        {
          ...claims, 
          aud: '/refresh'
        }, 
        jwt.JWT_TIMES.DAY * 7
      );

      { // dispatch event
        const sanitized = sanitize_auth_user(user);

        if(is_new_user) {
          await app.pubsub.dispatch(
            'auth/signup',
            sanitized
          );
        } else {
          await app.pubsub.dispatch(
            'auth/signin',
            sanitized
          );
        }
      }

      return {
          token_type: 'Bearer',
          user_id: user.id,
          access_token, 
          refresh_token
      }
    }  
  
  }


/**
 * @description get identity providers
 * 
 * @param {App} app 
 */  
export const identity_providers = (app) => {
  return Object.entries(app.auth_providers ?? {}).map(
    ([handle, value]) => (
      {
        provider: handle,
        name: value.name,
        logo_url: value.logo_url,
        description: value.description
      }
    )
  )
};
    

  


