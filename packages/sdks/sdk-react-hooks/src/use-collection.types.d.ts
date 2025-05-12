import type { App } from "@storecraft/core";
import type { 
  AuthUserType, ExtensionItemGet, 
  PaymentGatewayItemGet, ShippingMethodType 
} from "@storecraft/core/api";

export type collections_resources = | 
  "collections" | "products" | "tags" | "customers" | 
  "storefronts" | "images" | "posts" | "templates" | 
  "notifications" | "discounts" | "orders" | "shipping" | 
  "auth/users" | "chats";

export type extra_non_collections_resources = 'payments/gateways' | 'extensions';
export type queryable_resources = collections_resources | 
  extra_non_collections_resources;

export type InferLastSlug<T extends string> = 
  T extends `${string}/${infer Last}` ? 
  InferLastSlug<Last> : 
  T;

type atest = {
  a: InferLastSlug<'collections/products'>,
}

type cc = string
export type ResourcesMap = {
  'users': App["__show_me_everything"]["db"]["resources"]['auth_users']["$type_get"],
  'shipping': App["__show_me_everything"]["db"]["resources"]['shipping_methods']["$type_get"],
  'orders': App["__show_me_everything"]["db"]["resources"]['orders']["$type_get"],
  'discounts': App["__show_me_everything"]["db"]["resources"]['discounts']["$type_get"],
  'notifications': App["__show_me_everything"]["db"]["resources"]['notifications']["$type_get"],
  'templates': App["__show_me_everything"]["db"]["resources"]['templates']["$type_get"],
  'posts': App["__show_me_everything"]["db"]["resources"]['posts']["$type_get"],
  'images': App["__show_me_everything"]["db"]["resources"]['images']["$type_get"],
  'storefronts': App["__show_me_everything"]["db"]["resources"]['storefronts']["$type_get"],
  'customers': App["__show_me_everything"]["db"]["resources"]['customers']["$type_get"],
  'collections': App["__show_me_everything"]["db"]["resources"]['collections']["$type_get"],
  'products': App["__show_me_everything"]["db"]["resources"]['products']["$type_get"],
  'tags': App["__show_me_everything"]["db"]["resources"]['tags']["$type_get"],
  'chats': App["__show_me_everything"]["db"]["resources"]['chats']["$type_get"],
  'extensions': ExtensionItemGet,
  'gateways': PaymentGatewayItemGet,
}

export type InferQueryableType<
  T extends string = string,
> = ResourcesMap[InferLastSlug<T>]
