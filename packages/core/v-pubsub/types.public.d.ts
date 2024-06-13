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


/**
 * @description `events` subscribtion callbacks
 */
export interface PubSubOnEvents {
  
  on(event: events['storefronts_upsert'], callback: PubSubSubscriberForUpsert<StorefrontType>) : Function;
  on(event: events['storefronts_remove'], callback: PubSubSubscriberForRemove<StorefrontType>) : Function;
  on(event: events['storefronts_get'], callback: PubSubSubscriberForGet<StorefrontType>) : Function;
  on(event: events['storefronts_list'], callback: PubSubSubscriberForGet<StorefrontType[]>) : Function;
  
  on(event: events['customers_upsert'], callback: PubSubSubscriberForUpsert<CustomerType>) : Function;
  on(event: events['customers_remove'], callback: PubSubSubscriberForRemove<CustomerType>) : Function;
  on(event: events['customers_get'], callback: PubSubSubscriberForGet<CustomerType>) : Function;
  on(event: events['customers_list'], callback: PubSubSubscriberForGet<CustomerType[]>) : Function;
  
  on(event: events['tags_upsert'], callback: PubSubSubscriberForUpsert<TagType>) : Function;
  on(event: events['tags_remove'], callback: PubSubSubscriberForRemove<TagType>) : Function;
  on(event: events['tags_get'], callback: PubSubSubscriberForGet<TagType>) : Function;
  on(event: events['tags_list'], callback: PubSubSubscriberForGet<TagType[]>) : Function;

  on(event: events['products_upsert'], callback: PubSubSubscriberForUpsert<ProductType>) : Function;
  on(event: events['products_remove'], callback: PubSubSubscriberForRemove<ProductType>) : Function;
  on(event: events['products_get'], callback: PubSubSubscriberForGet<ProductType>) : Function;
  on(event: events['products_list'], callback: PubSubSubscriberForGet<ProductType[]>) : Function;

  on(event: events['collections_upsert'], callback: PubSubSubscriberForUpsert<CollectionType>) : Function;
  on(event: events['collections_remove'], callback: PubSubSubscriberForRemove<CollectionType>) : Function;
  on(event: events['collections_get'], callback: PubSubSubscriberForGet<CollectionType>) : Function;
  on(event: events['collections_list'], callback: PubSubSubscriberForGet<CollectionType[]>) : Function;

  on(event: events['orders_upsert'], callback: PubSubSubscriberForUpsert<OrderData>) : Function;
  on(event: events['orders_remove'], callback: PubSubSubscriberForRemove<OrderData>) : Function;
  on(event: events['orders_get'], callback: PubSubSubscriberForGet<OrderData>) : Function;
  on(event: events['orders_list'], callback: PubSubSubscriberForGet<OrderData[]>) : Function;

  on(event: events['discounts_upsert'], callback: PubSubSubscriberForUpsert<DiscountType>) : Function;
  on(event: events['discounts_remove'], callback: PubSubSubscriberForRemove<DiscountType>) : Function;
  on(event: events['discounts_get'], callback: PubSubSubscriberForGet<DiscountType>) : Function;
  on(event: events['discounts_list'], callback: PubSubSubscriberForGet<DiscountType[]>) : Function;

  on(event: events['shipping_upsert'], callback: PubSubSubscriberForUpsert<ShippingMethodType>) : Function;
  on(event: events['shipping_remove'], callback: PubSubSubscriberForRemove<ShippingMethodType>) : Function;
  on(event: events['shipping_get'], callback: PubSubSubscriberForGet<ShippingMethodType>) : Function;
  on(event: events['shipping_list'], callback: PubSubSubscriberForGet<ShippingMethodType[]>) : Function;

  on(event: events['posts_upsert'], callback: PubSubSubscriberForUpsert<PostType>) : Function;
  on(event: events['posts_remove'], callback: PubSubSubscriberForRemove<PostType>) : Function;
  on(event: events['posts_get'], callback: PubSubSubscriberForGet<PostType>) : Function;
  on(event: events['posts_list'], callback: PubSubSubscriberForGet<PostType[]>) : Function;

  on(event: events['images_upsert'], callback: PubSubSubscriberForUpsert<ImageType>) : Function;
  on(event: events['images_remove'], callback: PubSubSubscriberForRemove<ImageType>) : Function;
  on(event: events['images_get'], callback: PubSubSubscriberForGet<ImageType>) : Function;
  on(event: events['images_list'], callback: PubSubSubscriberForGet<ImageType[]>) : Function;

  on(event: events['templates_upsert'], callback: PubSubSubscriberForUpsert<TemplateType>) : Function;
  on(event: events['templates_remove'], callback: PubSubSubscriberForRemove<TemplateType>) : Function;
  on(event: events['templates_get'], callback: PubSubSubscriberForGet<TemplateType>) : Function;
  on(event: events['templates_list'], callback: PubSubSubscriberForGet<TemplateType[]>) : Function;

  on(event: events['checkout_create'], callback: PubSubSubscriber<OrderData>) : Function;
  on(event: events['checkout_complete'], callback: PubSubSubscriber<OrderData>) : Function;
  
  on(event: events['auth_signup'], callback: PubSubSubscriber<Partial<AuthUserType>>) : Function;
  on(event: events['auth_signin'], callback: PubSubSubscriber<Partial<AuthUserType>>) : Function;
  on(event: events['auth_remove'], callback: PubSubSubscriber<Partial<AuthUserType>>) : Function;

  // general gateway
  on<E=any>(event: string, callback: PubSubSubscriber<Partial<E>>) : Function;
}
