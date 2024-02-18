import { AuthUserType } from './types.api.js';
import { JWTClaims } from './v-crypto/jwt.ts';
import { Polka } from './v-polka/index.js'
import type { VPolkaRequest, VPolkaResponse } from './v-polka/public.js'
export type { VPolkaRequest, VPolkaResponse } from './v-polka/public.js'

export type ApiRequest = VPolkaRequest & {
  user?: Partial<JWTClaims> & Partial<AuthUserType>;
}

export type ApiResponse = VPolkaResponse & {
}

export type ApiPolka = Polka<ApiRequest, ApiResponse>;

export declare interface PlatformAdapter<PlatformNativeRequest, PlatformContext, H> {
    /**
     * convert a platform native request into web api request.
     * @param from something
     * @returns 
     */
    encode: (from: PlatformNativeRequest)=> Promise<Request>;

    /**
     * Handle the computed web response with context in case it is needed,
     * In node.js for example, we have to stream it into the native server-response.
     * @param web_response 
     * @param context 
     * @returns 
     */
    handleResponse: (web_response: Response, context: PlatformContext) => Promise<H>;

    /**
     * Get the environment variables of a platform
     */
    get env(): Record<string, string>;

    $from?: PlatformNativeRequest;
    $context?: PlatformContext;
}

export * from './index.js'
export type * from './types.database.js'
export type * from './types.api.d.ts'
export type * from './types.api.query.d.ts'
export type * from './types.storage.d.ts'
export type * from './types.payments.d.ts'

