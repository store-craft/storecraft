import type { AuthUserType } from '../api/types.api.d.ts';
import { JWTClaims } from '../crypto/jwt.js';
import { Polka } from './polka/index.js';
import type { VPolkaRequest, VPolkaResponseCreator } from './polka/public.d.ts';

export type ApiRequest = VPolkaRequest & {
  user?: Partial<JWTClaims> & Partial<Pick<AuthUserType, 'roles' | 'email' | 'firstname' | 'lastname'>>;
}

export type ApiResponse = VPolkaResponseCreator & {
}

export type ApiPolka = Polka<ApiRequest, ApiResponse>;
