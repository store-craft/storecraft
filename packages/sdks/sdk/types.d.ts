import type { ApiAuthResult, ApiKeyResult } from '@storecraft/core/api';

export * from './index.js';

/**
 * @description The `storecraft` **SDK** 
 * `auth` config, represents either `apikey` or `jwt` authentication
 */
export type SdkConfigAuth = ApiAuthResult | ApiKeyResult;

/**
 * @description The `storecraft` **SDK** config
 */
export type StorecraftSDKConfig = {

  /** Endpoint of `backend` */
  endpoint?: string;

  /** `auth` info, may be either `apikey` or `jwt` results */
  auth?: SdkConfigAuth;
}
