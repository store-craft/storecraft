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
 * Basic config for storecraft
 */
export type Config = {
  /** Seed admin emails, if absent will be infered at init by 
   * `platform.env.SC_ADMIN_EMAILS` environment as CSV of emails */
  admins_emails?: string[];
  /** password hash rounds, if absent will be infered at init by 
   * `platform.env.SC_AUTH_PASS_HASH_ROUNDS` environment  */
  auth_password_hash_rounds?: number;
  /** access token signing secret, if absent will be infered at init by 
   * `platform.env.SC_AUTH_SECRET_ACCESS_TOKEN` environment  */
  auth_secret_access_token: string;
  /** refresh token signing secret, if absent will be infered at init by 
   * `platform.env.SC_AUTH_SECRET_REFRESH_TOKEN` environment  */
  auth_secret_refresh_token: string;
}

export { App } from './index.js'
