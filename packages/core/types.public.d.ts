import { AuthUserType } from './v-api/types.api.js';
import { JWTClaims } from './v-crypto/jwt.ts';
import { Polka } from './v-polka/index.js'
import type { VPolkaRequest, VPolkaResponse } from './v-polka/public.js'
export type { VPolkaRequest, VPolkaResponse } from './v-polka/public.js'

export type ApiRequest = VPolkaRequest & {
  user?: Partial<JWTClaims> & Pick<AuthUserType, 'roles'>;
}

export type ApiResponse = VPolkaResponse & {
}

export type ApiPolka = Polka<ApiRequest, ApiResponse>;

/**
 * 
 * @description Basic config for `storecraft`
 */
export type Config = {

  /**
   *  
   * @description The store name
   * `platform.env.SC_GENERAL_STORE_NAME` environment
   */
  general_store_name?: string;

  /**
   *  
   * @description The store website
   * `platform.env.SC_GENERAL_STORE_WEBSITE` environment
   */
  general_store_website?: string;

  /**
   *  
   * @description The store description
   * `platform.env.SC_GENERAL_STORE_DESCRIPTION` environment
   */
  general_store_description?: string;

  /**
   *  
   * @description The store support email
   * `platform.env.SC_GENERAL_STORE_SUPPORT_EMAIL` environment
   */
  general_store_support_email?: string;
  
  /**
   *  
   * @description Seed admin emails, if absent will be infered at init by 
   * `platform.env.SC_AUTH_ADMIN_EMAILS` environment as CSV of emails 
   */
  auth_admins_emails?: string[];

  /** 
   * 
   * @description password hash rounds, if absent will be infered at init by 
   * `platform.env.SC_AUTH_PASS_HASH_ROUNDS` environment  
   */
  auth_password_hash_rounds?: number;

  /** 
   * 
   * @description access token signing secret, if absent will be infered 
   * at init by `platform.env.SC_AUTH_SECRET_ACCESS_TOKEN` environment  
   */
  auth_secret_access_token: string;

  /** 
   * 
   * @description refresh token signing secret, if absent will be infered at 
   * init by `platform.env.SC_AUTH_SECRET_REFRESH_TOKEN` environment  
   */
  auth_secret_refresh_token: string;

  /** 
   * 
   * @description (Optional) automatically reserve stock, if absent will be 
   * infered at init by `platform.env.SC_CHECKOUT_RESERVE_STOCK_ON` environment.
   * @default never
   */
  checkout_reserve_stock_on?: 'checkout_create' | 'checkout_complete' | 'never'

  /** 
   * 
   * @description (Optional) Once object `storage` is used, you may have connected a 
   * **CDN** to buckets to take advantage of faster assets serving instead of serving 
   * from your server / the storage service directly. If you are using an cloud based 
   * storage service such as AWS S3, it is very recommended to attach the bucket to 
   * a **CDN** for super fast and efficient serving.
   * 
   * Take note, most cloud based storage services and `storecraft` drivers support creating 
   * `presigned` urls for `download` / `upload`, which essentially delegate these operations
   * to the storage services. However, **CDN** is always the best choice for assets serving
   * cost and latency wise.
   * 
   * if absent will be infered at init by `platform.env.SC_STORAGE_REWRITE_URLS` environment.
   * @default undefined
   */
  storage_rewrite_urls?: string;

}

export { App } from './index.js'
