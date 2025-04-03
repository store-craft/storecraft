import type { App } from "@storecraft/core";
import type { ExtensionItemGet, PaymentGatewayItemGet } from "@storecraft/core/api";

export type collections_resources = Exclude<keyof App["db"]["resources"], 'search'>;
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
  [K in collections_resources]: App["db"]["resources"][K]["$type_get"]
} & {
  'extensions': ExtensionItemGet,
  'gateways': PaymentGatewayItemGet,
}

export type InferQueryableType<
  T extends string = string,
> = ResourcesMap[InferLastSlug<T>]
