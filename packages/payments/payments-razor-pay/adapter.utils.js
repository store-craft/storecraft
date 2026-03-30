/**
 * @import { Config } from './types.public.js'
 */

/** razorpay api base url */
export const RAZORPAY_BASE_URL = "https://api.razorpay.com/v1";

/**
 * throws an error with the response body text if the response is not ok
 * @param {Response} response
 */
export const throw_bad_response = async (response) => {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`razorpay api error ${response.status}: ${text}`);
  }
};

/**
 * builds the basic auth header from key_id and key_secret.
 * razorpay uses http basic auth for all api calls.
 * @param {Config} config
 * @returns {string} the Authorization header value
 */
export const get_auth_header = (config) => {
  const credentials = `${config.key_id}:${config.key_secret}`;
  return `Basic ${btoa(credentials)}`;
};

/**
 * makes an authenticated request to the razorpay api.
 * @param {Config} config
 * @param {string} path - relative path, e.g. 'orders' or 'payments/pay_XXX/capture'
 * @param {RequestInit} init
 * @returns {Promise<Response>}
 */
export const fetch_razorpay = async (config, path, init = {}) => {
  const { headers: extra_headers, ...rest_init } = init;

  return fetch(`${RAZORPAY_BASE_URL}/${path}`, {
    ...rest_init,
    headers: {
      "Content-Type": "application/json",
      Authorization: get_auth_header(config),
      ...(extra_headers ?? {}),
    },
  });
};

/**
 * verifies a razorpay webhook signature.
 * razorpay signs the webhook body with hmac-sha256 using your webhook secret.
 * https://razorpay.com/docs/webhooks/validate-test/
 *
 * @param {string} raw_body - the raw request body as a string
 * @param {string} received_signature - the x-razorpay-signature header value
 * @param {string} webhook_secret - your razorpay webhook secret
 * @returns {Promise<boolean>}
 */
export const verify_webhook_signature = async (
  raw_body,
  received_signature,
  webhook_secret,
) => {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(webhook_secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature_buffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(raw_body),
  );
  const computed = Array.from(new Uint8Array(signature_buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return computed === received_signature;
};

/**
 * converts a decimal amount to razorpay's smallest currency unit.
 * for INR and most currencies, this means multiplying by 100.
 * razorpay does not support sub-paise so we floor.
 * @param {number} amount - amount in major currency unit (e.g. 99.50)
 * @returns {number} amount in smallest unit (e.g. 9950)
 */
export const to_razorpay_amount = (amount) => {
  return Math.floor(amount * 100);
};
