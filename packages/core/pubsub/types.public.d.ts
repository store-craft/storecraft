import type { App } from '../types.public.js';
import type { 
  AuthUserType, CollectionType, CustomerType, DiscountType, 
  ImageType, OrderData, PostType, ProductType, ShippingMethodType, 
  StorefrontType, StorefrontTypeUpsert, TagType, TemplateType 
} from '../api/types.api.d.ts';

export * from './public.js';

/**
 * @description `storecraft` events map, use {@link PubSubEvent} for name guidance
 */
export type events = {
  'storefronts/upsert': PayloadForUpsert<StorefrontType>, 
  'storefronts/remove': PayloadForRemove<StorefrontType>,
  'storefronts/get': PayloadForGet<StorefrontType>,
  'storefronts/list': PayloadForGet<StorefrontType[]>,

  'customers/upsert': PayloadForUpsert<CustomerType> 
  'customers/remove': PayloadForRemove<CustomerType> ,
  'customers/get': PayloadForGet<CustomerType> 
  'customers/list': PayloadForGet<CustomerType[]>,

  'tags/upsert': PayloadForUpsert<TagType>
  'tags/remove': PayloadForRemove<TagType> ,
  'tags/get': PayloadForGet<TagType>
  'tags/list': PayloadForGet<TagType[]>

  'products/upsert': PayloadForUpsert<ProductType> 
  'products/remove': PayloadForRemove<ProductType>,
  'products/get': PayloadForGet<ProductType>
  'products/list': PayloadForGet<ProductType[]>

  'collections/upsert': PayloadForUpsert<CollectionType> 
  'collections/remove': PayloadForRemove<CollectionType>
  'collections/get': PayloadForGet<CollectionType>
  'collections/list': PayloadForGet<CollectionType[]>

  'orders/upsert': PayloadForUpsert<OrderData> 
  'orders/remove': PayloadForRemove<OrderData>
  'orders/get': PayloadForGet<OrderData>
  'orders/list': PayloadForGet<OrderData[]>

  'discounts/upsert': PayloadForUpsert<DiscountType>
  'discounts/remove': PayloadForRemove<DiscountType>
  'discounts/get': PayloadForGet<DiscountType>
  'discounts/list': PayloadForGet<DiscountType[]>

  'shipping/upsert': PayloadForUpsert<ShippingMethodType>
  'shipping/remove': PayloadForRemove<ShippingMethodType>
  'shipping/get': PayloadForGet<ShippingMethodType>
  'shipping/list': PayloadForGet<ShippingMethodType[]>

  'posts/upsert': PayloadForUpsert<PostType>
  'posts/remove': PayloadForRemove<PostType>
  'posts/get': PayloadForGet<PostType>
  'posts/list': PayloadForGet<PostType[]>

  'images/upsert': PayloadForUpsert<ImageType>
  'images/remove': PayloadForRemove<ImageType>
  'images/get': PayloadForGet<ImageType>
  'images/list': PayloadForGet<ImageType[]>

  'templates/upsert': PayloadForUpsert<TemplateType>
  'templates/remove': PayloadForRemove<TemplateType>
  'templates/get': PayloadForGet<TemplateType>
  'templates/list': PayloadForGet<TemplateType[]>

  'orders/checkout/created': PayloadForUpsert<OrderData>
  'orders/checkout/complete': PayloadForUpsert<OrderData>
  'orders/checkout/requires_action': PayloadForUpsert<OrderData>
  'orders/checkout/failed': PayloadForUpsert<OrderData>
  'orders/checkout/unknown': PayloadForUpsert<OrderData>
  'orders/checkout/update': PayloadForUpsert<OrderData>

  'orders/fulfillment/draft': PayloadForUpsert<OrderData>
  'orders/fulfillment/processing': PayloadForUpsert<OrderData>
  'orders/fulfillment/shipped': PayloadForUpsert<OrderData>
  'orders/fulfillment/fulfilled': PayloadForUpsert<OrderData>
  'orders/fulfillment/cancelled': PayloadForUpsert<OrderData>
  'orders/fulfillment/update': PayloadForUpsert<OrderData> 

  
  'orders/payments/unpaid': PayloadForUpsert<OrderData> 
  'orders/payments/authorized': PayloadForUpsert<OrderData> 
  'orders/payments/captured': PayloadForUpsert<OrderData>
  'orders/payments/requires_auth': PayloadForUpsert<OrderData>
  'orders/payments/voided': PayloadForUpsert<OrderData>
  'orders/payments/failed': PayloadForUpsert<OrderData>
  'orders/payments/partially_paid': PayloadForUpsert<OrderData>
  'orders/payments/refunded': PayloadForUpsert<OrderData>
  'orders/payments/partially_refunded': PayloadForUpsert<OrderData>
  'orders/payments/cancelled': PayloadForUpsert<OrderData>
  'orders/payments/update': PayloadForUpsert<OrderData>

  'auth/signup': Partial<AuthUserType>
  'auth/signin': Partial<AuthUserType>
  'auth/refresh': Partial<AuthUserType>
  'auth/remove': Partial<AuthUserType>
  'auth/upsert': Partial<AuthUserType>
  'auth/apikey-created': Partial<AuthUserType>

  'auth/confirm-email-token-generated': {
    auth_user: Partial<AuthUserType>,
    /** confirm email token */
    token: string
  }

  'auth/confirm-email-token-confirmed': Partial<AuthUserType>

  'auth/forgot-password-token-generated': {
    auth_user: Partial<AuthUserType>,
    /** confirm email token */
    token: string
  }

  'auth/forgot-password-token-confirmed': Partial<AuthUserType>

  'auth/change-password': Partial<AuthUserType> 
}



/**
 * @description A list of native `storecraft` events
 */
export type PubSubEvent = keyof events;

export type EventPayload<T=any, App=App, E extends (PubSubEvent | string) =( PubSubEvent | string)> = {
  /**
   * @description payload
   */
  payload?: T;

  /**
   * @description event type
   */
  event: E;

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
 * @description common payload types structures
 */
export type PayloadForGet<T=any> = { current: T };
export type PayloadForUpsert<T=any> = { previous: T, current: T };
export type PayloadForRemove<T=any> = { previous: T, success: boolean };


/**
 * 
 * @description Subscriber method spec
 * 
 */
export type PubSubSubscriber<T=any, AppType=App> = ((value: EventPayload<T, AppType>) => any) | 
      ((value: EventPayload<T, AppType>) => Promise<any>);

export type PubSubSubscriberForGet<T=any, AppType=App> = PubSubSubscriber<PayloadForGet<T>, AppType>;
export type PubSubSubscriberForUpsert<T=any, AppType=App> = PubSubSubscriber<PayloadForUpsert<T>, AppType>;
export type PubSubSubscriberForRemove<T=any, AppType=App> = PubSubSubscriber<PayloadForRemove<T>, AppType>;

/**
 * @description `events` subscribtion callbacks, currently not using this.
 * It demonstrates function overloading with templates
 */
export interface PubSubOnEvents<R=Function, AppType=App> {
  on<E extends keyof events>(event: E, callback: PubSubSubscriber<events[E], AppType>): R;
  // general gateway
  on(event: string, callback: PubSubSubscriber<any, AppType>) : R;
}
