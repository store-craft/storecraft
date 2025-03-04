export { Resend } from './adapter.js';

/**
 * @description `Resend` config
 */
export type Config = {
  /**
   * @description Your API Key, if missing, it will be inferred from environment variable `RESEND_API_KEY`
   */
  apikey?: string,
};

