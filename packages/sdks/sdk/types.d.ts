import type { ApiAuthResult, ApiKeyResult } from '@storecraft/core/api';

export * from './index.js';

/**
 * @description The `storecraft` **SDK** `auth` config, 
 * represents either `apikey` or `jwt` authentication
 */
export type SdkConfigAuth = ApiAuthResult | ApiKeyResult;

/**
 * @description The `storecraft` **SDK** config
 */
export type StorecraftSDKConfig = {

  /** 
   * @description Endpoint of `backend` 
   */
  endpoint?: string;

  /** 
   * @description `auth` info, may be either `apikey` or `jwt` results.
   * This will be setup automatically when performing `login` or 
   * `apikey` operations if
   * - the {@link StorecraftSDKConfig.persist_auth} is set to `true`.
   * - This us used by the sdk to re-authenticate the user when 
   * the token expires.
   */
  auth?: SdkConfigAuth;
}

export type Fetcher = (
  input: RequestInfo, init?: RequestInit
) => Promise<Response>