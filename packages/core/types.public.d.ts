import { Polka } from './v-polka/index.js'
import type { VPolkaRequest, VPolkaResponse } from './v-polka/public.js'
export type { VPolkaRequest, VPolkaResponse } from './v-polka/public.js'

export type ApiRequest = VPolkaRequest & {
  user?: string;
}

export type ApiResponse = VPolkaResponse & {
}

export type ApiPolka = Polka<ApiRequest, ApiResponse>;

export declare interface PlatformAdapter<PlatformNativeRequest, PlatformContext> {
    /**
     * hello
     * @param from something
     * @returns 
     */
    encode: (from: PlatformNativeRequest)=> Promise<Request>;

    /**
     * Handle the computed web response with context
     * @param web_response 
     * @param context 
     * @returns 
     */
    handleResponse: (web_response: Response, context: PlatformContext) => Promise<void>;

    /**
     * Get the environment variables of a platform
     */
    get env(): Record<string, string>;

    $from?: PlatformNativeRequest;
    $context?: PlatformContext;
}

export * from './index.js'
export type * from './types.driver.js'
export type * from './types.api.js'