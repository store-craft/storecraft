import type { App } from '../types.public.js';
import type { 
  AuthUserType, CollectionType, CustomerType, DiscountType, 
  ImageType, OrderData, PostType, ProductType, ShippingMethodType, 
  StorefrontType, TagType, TemplateType 
} from '../v-api/types.api.d.ts';

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
  auth_change_password: 'auth/change-password',
}



/**
 * @description A list of native `storecraft` events
 */
export type PubSubEvent = events[keyof events] ;

export type EventPayload<T=any, App=App> = {
  /**
   * @description payload
   */
  payload?: T;

  /**
   * @description event type
   */
  event: PubSubEvent;

  /**
   * @description `storecraft` app instance
   */
  app: App;

  /**
   * @description Stop the event propagation
   */
  stopPropagation: () => any;
}

/**
 * 
 * @description Subscriber method spec
 * 
 */
export type PubSubSubscriber<T=any, AppType=App> = ((value: EventPayload<T, AppType>) => any) | 
      ((value: EventPayload<T, AppType>) => Promise<any>);

export type PubSubSubscriberForUpsert<T=any, AppType=App> = PubSubSubscriber<{
  previous: T,
  current: T,
}, AppType>;

export type PubSubSubscriberForGet<T=any, AppType=App> = PubSubSubscriber<{ current: T }, AppType>;

export type PubSubSubscriberForRemove<T=any, AppType=App> = PubSubSubscriber<{ previous: T, success: boolean }, AppType>;


/**
 * @description `events` subscribtion callbacks
 */
export interface PubSubOnEvents<R=Function, AppType=App> {
  
  on(event: events['storefronts_upsert'], callback: PubSubSubscriberForUpsert<StorefrontType, AppType>) : R;
  on(event: events['storefronts_remove'], callback: PubSubSubscriberForRemove<StorefrontType, AppType>) : R;
  on(event: events['storefronts_get'], callback: PubSubSubscriberForGet<StorefrontType, AppType>) : R;
  on(event: events['storefronts_list'], callback: PubSubSubscriberForGet<StorefrontType[], AppType>) : R;
  
  on(event: events['customers_upsert'], callback: PubSubSubscriberForUpsert<CustomerType, AppType>) : R;
  on(event: events['customers_remove'], callback: PubSubSubscriberForRemove<CustomerType, AppType>) : R;
  on(event: events['customers_get'], callback: PubSubSubscriberForGet<CustomerType, AppType>) : R;
  on(event: events['customers_list'], callback: PubSubSubscriberForGet<CustomerType[], AppType>) : R;
  
  on(event: events['tags_upsert'], callback: PubSubSubscriberForUpsert<TagType, AppType>) : R;
  on(event: events['tags_remove'], callback: PubSubSubscriberForRemove<TagType, AppType>) : R;
  on(event: events['tags_get'], callback: PubSubSubscriberForGet<TagType, AppType>) : R;
  on(event: events['tags_list'], callback: PubSubSubscriberForGet<TagType[], AppType>) : R;

  on(event: events['products_upsert'], callback: PubSubSubscriberForUpsert<ProductType, AppType>) : R;
  on(event: events['products_remove'], callback: PubSubSubscriberForRemove<ProductType, AppType>) : R;
  on(event: events['products_get'], callback: PubSubSubscriberForGet<ProductType, AppType>) : R;
  on(event: events['products_list'], callback: PubSubSubscriberForGet<ProductType[], AppType>) : R;

  on(event: events['collections_upsert'], callback: PubSubSubscriberForUpsert<CollectionType, AppType>) : R;
  on(event: events['collections_remove'], callback: PubSubSubscriberForRemove<CollectionType, AppType>) : R;
  on(event: events['collections_get'], callback: PubSubSubscriberForGet<CollectionType, AppType>) : R;
  on(event: events['collections_list'], callback: PubSubSubscriberForGet<CollectionType[], AppType>) : R;

  on(event: events['orders_upsert'], callback: PubSubSubscriberForUpsert<OrderData, AppType>) : R;
  on(event: events['orders_remove'], callback: PubSubSubscriberForRemove<OrderData, AppType>) : R;
  on(event: events['orders_get'], callback: PubSubSubscriberForGet<OrderData, AppType>) : R;
  on(event: events['orders_list'], callback: PubSubSubscriberForGet<OrderData[], AppType>) : R;

  on(event: events['discounts_upsert'], callback: PubSubSubscriberForUpsert<DiscountType, AppType>) : R;
  on(event: events['discounts_remove'], callback: PubSubSubscriberForRemove<DiscountType, AppType>) : R;
  on(event: events['discounts_get'], callback: PubSubSubscriberForGet<DiscountType, AppType>) : R;
  on(event: events['discounts_list'], callback: PubSubSubscriberForGet<DiscountType[], AppType>) : R;

  on(event: events['shipping_upsert'], callback: PubSubSubscriberForUpsert<ShippingMethodType, AppType>) : R;
  on(event: events['shipping_remove'], callback: PubSubSubscriberForRemove<ShippingMethodType, AppType>) : R;
  on(event: events['shipping_get'], callback: PubSubSubscriberForGet<ShippingMethodType, AppType>) : R;
  on(event: events['shipping_list'], callback: PubSubSubscriberForGet<ShippingMethodType[], AppType>) : R;

  on(event: events['posts_upsert'], callback: PubSubSubscriberForUpsert<PostType, AppType>) : R;
  on(event: events['posts_remove'], callback: PubSubSubscriberForRemove<PostType, AppType>) : R;
  on(event: events['posts_get'], callback: PubSubSubscriberForGet<PostType, AppType>) : R;
  on(event: events['posts_list'], callback: PubSubSubscriberForGet<PostType[], AppType>) : R;

  on(event: events['images_upsert'], callback: PubSubSubscriberForUpsert<ImageType, AppType>) : R;
  on(event: events['images_remove'], callback: PubSubSubscriberForRemove<ImageType, AppType>) : R;
  on(event: events['images_get'], callback: PubSubSubscriberForGet<ImageType, AppType>) : R;
  on(event: events['images_list'], callback: PubSubSubscriberForGet<ImageType[], AppType>) : R;

  on(event: events['templates_upsert'], callback: PubSubSubscriberForUpsert<TemplateType, AppType>) : R;
  on(event: events['templates_remove'], callback: PubSubSubscriberForRemove<TemplateType, AppType>) : R;
  on(event: events['templates_get'], callback: PubSubSubscriberForGet<TemplateType, AppType>) : R;
  on(event: events['templates_list'], callback: PubSubSubscriberForGet<TemplateType[], AppType>) : R;

  on(event: events['checkout_create'], callback: PubSubSubscriber<Partial<OrderData>, AppType>) : R;
  on(event: events['checkout_complete'], callback: PubSubSubscriber<Partial<OrderData>, AppType>) : R;
  
  on(event: events['auth_signup'], callback: PubSubSubscriber<Partial<AuthUserType>, AppType>) : R;
  on(event: events['auth_signin'], callback: PubSubSubscriber<Partial<AuthUserType>, AppType>) : R;
  on(event: events['auth_remove'], callback: PubSubSubscriber<Partial<AuthUserType>, AppType>) : R;
  on(event: events['auth_change_password'], callback: PubSubSubscriber<Partial<AuthUserType>, AppType>) : R;

  // general gateway
  on<E=any>(event: string, callback: PubSubSubscriber<Partial<E>, AppType>) : R;
}
