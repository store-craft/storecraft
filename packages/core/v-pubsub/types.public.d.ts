export * from './public.js';

/**
 * @description A list of native `storecraft` events
 */
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
  'auth/signup' | 'auth/signin' | 'auth/refresh' | 
  'checkout/create' | 'checkout/complete' |
  'storage/put' | 'storage/get' | 'storage/remove';

/**
 * 
 * @description Subscriber method spec
 * 
 */
export type PubSubSubscriber<T=any> = ((value: T) => any) | ((value: T) => Promise<any>);



export interface ON {
  
  on(event: 'a', callback: PubSubSubscriber<'a'>) : any;
  on(event: 'b', callback: PubSubSubscriber<'b'>) : any;
}

  // | 
  // ((a:'customers/upsert', b:PubSubSubscriber<'cus'>) => any);