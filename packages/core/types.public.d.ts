export type { StorecraftConfig } from './v-api/types.api.d.ts'
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

export { App } from './index.js'
