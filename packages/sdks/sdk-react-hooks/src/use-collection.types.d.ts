import type { App } from "@storecraft/core";
import type { AuthUserType, ExtensionItemGet, PaymentGatewayItemGet, ShippingMethodType } from "@storecraft/core/api";

export type collections_resources = | 
  "collections" | "products" | "tags" | "customers" | 
  "storefronts" | "images" | "posts" | "templates" | 
  "notifications" | "discounts" | "orders" | "shipping" | 
  "auth/users";

export type extra_non_collections_resources = 'payments/gateways' | 'extensions';
export type queryable_resources = collections_resources | extra_non_collections_resources;

export type InferLastSlug<T extends string> = 
  T extends `${string}/${infer Last}` ? 
  InferLastSlug<Last> : 
  T;

type atest = {
  a: InferLastSlug<'collections/products'>,
}

type cc = string
export type ResourcesMap = {
//   [K in collections_resources]: App["db"]["resources"][K]["$type_get"]
// } & {
  'users': App["db"]["resources"]['auth_users']["$type_get"],
  'shipping': App["db"]["resources"]['shipping_methods']["$type_get"],
  'orders': App["db"]["resources"]['orders']["$type_get"],
  'discounts': App["db"]["resources"]['discounts']["$type_get"],
  'notifications': App["db"]["resources"]['notifications']["$type_get"],
  'templates': App["db"]["resources"]['templates']["$type_get"],
  'posts': App["db"]["resources"]['posts']["$type_get"],
  'images': App["db"]["resources"]['images']["$type_get"],
  'storefronts': App["db"]["resources"]['storefronts']["$type_get"],
  'customers': App["db"]["resources"]['customers']["$type_get"],
  'collections': App["db"]["resources"]['collections']["$type_get"],
  'products': App["db"]["resources"]['products']["$type_get"],
  'tags': App["db"]["resources"]['tags']["$type_get"],
  'extensions': ExtensionItemGet,
  'gateways': PaymentGatewayItemGet,
}

export type InferQueryableType<
  T extends string = string,
> = ResourcesMap[InferLastSlug<T>]
