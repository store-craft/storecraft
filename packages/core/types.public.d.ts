
// type VPolkaRequest = {
//     body: any,
//     url?: string,
//     headers: Record<string, string>,
//     method: string;
// }

// type VPolkaResponse = {
//     body: any,
//     url?: string,
//     headers: Record<string, string>,
//     status: number;
// }

import { App } from './types.public.js';
import { Polka } from './v-polka/index.js'
import type { VPolkaRequest, VPolkaResponse } from './v-polka/public.js'
export type { VPolkaRequest, VPolkaResponse } from './v-polka/public.js'

export type TypeOrCreator<T, A, B> = ((app: App<A, B>) => T) | T;

export declare interface PlatformAdapter<PlatformNativeRequest, PlatformContext> {
    /**
     * hello
     * @param from something
     * @returns 
     */
    encode: (from: PlatformNativeRequest)=> Promise<VPolkaRequest>;

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

declare namespace TicketingSystem {
    type Ticket = {
        id: string;
        name: string; 
        status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'BLOCKED';
    };
}

export * from './index.js'
export type * from './types.driver.js'
export type * from './types.api.js'