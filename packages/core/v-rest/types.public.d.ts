import type { AuthUserType } from '../v-api/types.api.d.ts';
import { JWTClaims } from '../v-crypto/jwt.js';
import { Polka } from '../v-polka/index.js'
import type { VPolkaRequest, VPolkaResponse } from '../v-polka/public.d.ts'

export type ApiRequest = VPolkaRequest & {
  user?: Partial<JWTClaims> & Pick<AuthUserType, 'roles'>;
}

export type ApiResponse = VPolkaResponse & {
}

export type ApiPolka = Polka<ApiRequest, ApiResponse>;
