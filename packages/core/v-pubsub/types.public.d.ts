export * from './public.js';


export type PubSubEvent = | 
    'storefronts/upsert' | 'storefronts/remove' | 
    'customers/upsert' | 'customers/remove' | 
    'tags/upsert' | 'tags/remove' | 
    'products/upsert' | 'products/remove' | 
    'collections/upsert' | 'collections/remove' | 
    'orders/upsert' | 'orders/remove' | 
    'discounts/upsert' | 'discounts/remove' | 
    'shipping/upsert' | 'shipping/remove' | 
    'posts/upsert' | 'posts/remove' | 
    'images/upsert' | 'images/remove' | 
    'templates/upsert' | 'templates/remove' | 
    'auth_users/signup' | 'auth_users/signin' | 
    'checkout/create' | 'checkout/complete';

/**
 * @description Subscriber method
 */
export type PubSubSubscriber = (() => any) | (() => Promise<any>);
