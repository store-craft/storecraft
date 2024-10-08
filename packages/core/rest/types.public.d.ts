import type { AuthUserType } from '../api/types.api.d.ts';
import { JWTClaims } from '../crypto/jwt.js';
import { Polka } from '../polka/index.js';
import type { VPolkaRequest, VPolkaResponse } from '../polka/public.d.ts';

export type ApiRequest = VPolkaRequest & {
  user?: Partial<JWTClaims> & Pick<AuthUserType, 'roles'>;
}

export type ApiResponse = VPolkaResponse & {
}

export type ApiPolka = Polka<ApiRequest, ApiResponse>;
