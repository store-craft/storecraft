import { 
  AuthUserType, CollectionType, CustomerType, DiscountType, 
  ImageType, OrderData, PostType, ProductType, ShippingMethodType, 
  StorefrontType, TagType, TemplateType 
} from '../v-api/types.api.js';

export * from './public.js';

/**
 * @description `storecraft` events map, use {@link PubSubEvent} for name guidance
 */
export type events = {
  storefronts_upsert: 'storefronts/upsert', 
  storefronts_remove: 'storefronts/remove',
  storefronts_get: 'storefronts/get',
  storefronts_list: 'storefronts/list',

  customers_upsert: 'customers/upsert', 
  customers_remove: 'customers/remove',
  customers_get: 'customers/get',
  customers_list: 'customers/list',

  tags_upsert: 'tags/upsert',
  tags_remove: 'tags/remove',
  tags_get: 'tags/get',
  tags_list: 'tags/list',

  products_upsert: 'products/upsert', 
  products_remove: 'products/remove',
  products_get: 'products/get', 
  products_list: 'products/list',

  collections_upsert: 'collections/upsert', 
  collections_remove: 'collections/remove',
  collections_get: 'collections/get', 
  collections_list: 'collections/list',

  orders_upsert: 'orders/upsert', 
  orders_remove: 'orders/remove',
  orders_get: 'orders/get', 
  orders_list: 'orders/list',

  discounts_upsert: 'discounts/upsert', 
  discounts_remove: 'discounts/remove',
  discounts_get: 'discounts/get', 
  discounts_list: 'discounts/list',

  shipping_upsert: 'shipping/upsert', 
  shipping_remove: 'shipping/remove',
  shipping_get: 'shipping/get', 
  shipping_list: 'shipping/list',

  posts_upsert: 'posts/upsert', 
  posts_remove: 'posts/remove',
  posts_get: 'posts/get', 
  posts_list: 'posts/list',

  images_upsert: 'images/upsert', 
  images_remove: 'images/remove',
  images_get: 'images/get', 
  images_list: 'images/list',

  templates_upsert: 'templates/upsert', 
  templates_remove: 'templates/remove',
  templates_get: 'templates/get', 
  templates_list: 'templates/list',

  checkout_create: 'checkout/create', 
  checkout_complete: 'checkout/complete',

  auth_signup: 'auth/signup', 
  auth_signin: 'auth/signin', 
  auth_refersh: 'auth/refresh',
  auth_remove: 'auth/remove',
}



/**
 * @description A list of native `storecraft` events
 */
export type PubSubEvent = events[keyof events] ;

export type EventPayload<T=any> = {
  payload?: T;
  event: PubSubEvent;
}

/**
 * 
 * @description Subscriber method spec
 * 
 */
export type PubSubSubscriber<T=any> = ((value: EventPayload<T>) => any) | 
      ((value: EventPayload<T>) => Promise<any>);
export type PubSubSubscriberForUpsert<T=any> = PubSubSubscriber<{
  previous: T,
  current: T,
}>;
export type PubSubSubscriberForGet<T=any> = PubSubSubscriber<{ current: T }>;
export type PubSubSubscriberForRemove<T=any> = PubSubSubscriber<{ previous: T, success: boolean }>;



export interface PubSubOnEvents {
  
  on(event: events['storefronts_upsert'], callback: PubSubSubscriberForUpsert<StorefrontType>) : any;
  on(event: events['storefronts_remove'], callback: PubSubSubscriberForRemove<StorefrontType>) : any;
  on(event: events['storefronts_get'], callback: PubSubSubscriberForGet<StorefrontType>) : any;
  on(event: events['storefronts_list'], callback: PubSubSubscriberForGet<StorefrontType[]>) : any;
  
  on(event: events['customers_upsert'], callback: PubSubSubscriberForUpsert<CustomerType>) : any;
  on(event: events['customers_remove'], callback: PubSubSubscriberForRemove<CustomerType>) : any;
  on(event: events['customers_get'], callback: PubSubSubscriberForGet<CustomerType>) : any;
  on(event: events['customers_list'], callback: PubSubSubscriberForGet<CustomerType[]>) : any;
  
  on(event: events['tags_upsert'], callback: PubSubSubscriberForUpsert<TagType>) : any;
  on(event: events['tags_remove'], callback: PubSubSubscriberForRemove<TagType>) : any;
  on(event: events['tags_get'], callback: PubSubSubscriberForGet<TagType>) : any;
  on(event: events['tags_list'], callback: PubSubSubscriberForGet<TagType[]>) : any;

  on(event: events['products_upsert'], callback: PubSubSubscriberForUpsert<ProductType>) : any;
  on(event: events['products_remove'], callback: PubSubSubscriberForRemove<ProductType>) : any;
  on(event: events['products_get'], callback: PubSubSubscriberForGet<ProductType>) : any;
  on(event: events['products_list'], callback: PubSubSubscriberForGet<ProductType[]>) : any;

  on(event: events['collections_upsert'], callback: PubSubSubscriberForUpsert<CollectionType>) : any;
  on(event: events['collections_remove'], callback: PubSubSubscriberForRemove<CollectionType>) : any;
  on(event: events['collections_get'], callback: PubSubSubscriberForGet<CollectionType>) : any;
  on(event: events['collections_list'], callback: PubSubSubscriberForGet<CollectionType[]>) : any;

  on(event: events['orders_upsert'], callback: PubSubSubscriberForUpsert<OrderData>) : any;
  on(event: events['orders_remove'], callback: PubSubSubscriberForRemove<OrderData>) : any;
  on(event: events['orders_get'], callback: PubSubSubscriberForGet<OrderData>) : any;
  on(event: events['orders_list'], callback: PubSubSubscriberForGet<OrderData[]>) : any;

  on(event: events['discounts_upsert'], callback: PubSubSubscriberForUpsert<DiscountType>) : any;
  on(event: events['discounts_remove'], callback: PubSubSubscriberForRemove<DiscountType>) : any;
  on(event: events['discounts_get'], callback: PubSubSubscriberForGet<DiscountType>) : any;
  on(event: events['discounts_list'], callback: PubSubSubscriberForGet<DiscountType[]>) : any;

  on(event: events['shipping_upsert'], callback: PubSubSubscriberForUpsert<ShippingMethodType>) : any;
  on(event: events['shipping_remove'], callback: PubSubSubscriberForRemove<ShippingMethodType>) : any;
  on(event: events['shipping_get'], callback: PubSubSubscriberForGet<ShippingMethodType>) : any;
  on(event: events['shipping_list'], callback: PubSubSubscriberForGet<ShippingMethodType[]>) : any;

  on(event: events['posts_upsert'], callback: PubSubSubscriberForUpsert<PostType>) : any;
  on(event: events['posts_remove'], callback: PubSubSubscriberForRemove<PostType>) : any;
  on(event: events['posts_get'], callback: PubSubSubscriberForGet<PostType>) : any;
  on(event: events['posts_list'], callback: PubSubSubscriberForGet<PostType[]>) : any;

  on(event: events['images_upsert'], callback: PubSubSubscriberForUpsert<ImageType>) : any;
  on(event: events['images_remove'], callback: PubSubSubscriberForRemove<ImageType>) : any;
  on(event: events['images_get'], callback: PubSubSubscriberForGet<ImageType>) : any;
  on(event: events['images_list'], callback: PubSubSubscriberForGet<ImageType[]>) : any;

  on(event: events['templates_upsert'], callback: PubSubSubscriberForUpsert<TemplateType>) : any;
  on(event: events['templates_remove'], callback: PubSubSubscriberForRemove<TemplateType>) : any;
  on(event: events['templates_get'], callback: PubSubSubscriberForGet<TemplateType>) : any;
  on(event: events['templates_list'], callback: PubSubSubscriberForGet<TemplateType[]>) : any;

  on(event: events['checkout_create'], callback: PubSubSubscriber<OrderData>) : any;
  on(event: events['checkout_complete'], callback: PubSubSubscriber<OrderData>) : any;
  
  on(event: events['auth_signup'], callback: PubSubSubscriber<Partial<AuthUserType>>) : any;
  on(event: events['auth_signin'], callback: PubSubSubscriber<Partial<AuthUserType>>) : any;
  on(event: events['auth_remove'], callback: PubSubSubscriber<Partial<AuthUserType>>) : any;
  
}
