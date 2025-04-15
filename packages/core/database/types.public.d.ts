import type { 
  AuthUserType, BaseProductType, BaseType, 
  CollectionType, CollectionTypeUpsert, 
  CustomerType, CustomerTypeUpsert, 
  DiscountType, DiscountTypeUpsert, 
  ImageType, ImageTypeUpsert, 
  NotificationType, NotificationTypeUpsert, 
  OrderData, OrderDataUpsert, 
  PostType, PostTypeUpsert, 
  ProductType, ProductTypeUpsert, 
  VariantType, VariantTypeUpsert,
  ShippingMethodType, ShippingMethodTypeUpsert, 
  StorefrontType, StorefrontTypeUpsert, 
  TagType, TagTypeUpsert, 
  TemplateType, TemplateTypeUpsert, 
  QuickSearchResult,
  timestamps, 
} from "../api/types.api.d.ts";
import type { 
  ExpandQuery, ApiQuery 
} from "../api/types.api.query.d.ts";
import type { App } from '../types.public.d.ts'
export * from './public.js';

export type ID = string;
export type Handle = string;
export type HandleOrId = string;

type SearchTermsType = {
  /** A bunch of search terms to be queried by VQL boolean language */
  search?: string[];
}

export type RegularGetOptions<T extends any = any> = {
  expand? : ExpandQuery<T>;
}

export type idable_concrete = {
  id: string;
}

export type Aug = {
  search?: string[],
  created_at: string;
  updated_at: string;
}

type idable = { id: string }
export type withConcreteId<T> = Omit<T, 'id'> & idable;
export type withConcreteIdAndHandle<T> = Omit<T, 'id' | 'handle'> & { 
  id: string, 
  handle: string
};

/**
 * @description Basic collection or table
 */
export declare interface db_crud<U, G=U> {
  /** upsert type */
  $type_upsert?: U;
  /** get type */
  $type_get?: G;

  /**
   * get a single item by handle or id
   * @param id_or_handle 
   * @param options 
   */
  get: (
    id_or_handle: HandleOrId, options?: RegularGetOptions<G>
  ) => Promise<G>;
  /**
   * get bulk of items, ordered, if something is missing, `undefined`
   * should be instead
   * @param ids array of ids
   * @param options 
   */
  getBulk?: (ids: string[], options?: RegularGetOptions<G>) => Promise<G[]>;

  /**
   * Insert or Replace an item
   * @param data 
   * @param [search_terms] array of search terms realte to the item
   */
  upsert: (data: U, search_terms?: string[]) => Promise<boolean>;

  /**
   * TODO: remove and put only in notifications
   * bulk upsert 
   * @param data 
   * @param search_terms 
   * @returns 
   */
  upsertBulk?: (data: (U)[], search_terms?: string[][]) => Promise<boolean>;

  /**
   * Delete an item
   * @param id_or_handle 
   */
  remove: (id_or_handle: HandleOrId) => Promise<boolean>

  /**
   * List items with `query`
   */
  list: (query: ApiQuery<G>) => Promise<G[]>;

  /**
   * Count items with `query`
   */
  count?: (query: ApiQuery<G>) => Promise<number>;
}

export type OmitGetByHandle<T> = Omit<T, 'getByHandle'>;

/** @description `AuthUserType` crud */
export interface db_auth_users extends OmitGetByHandle<db_crud<AuthUserType>> {
  /**
   * get by email
   * @param email 
   */
  getByEmail: (email?: string) => Promise<AuthUserType>;
  /**
   * remove by email
   * @param email 
   */
  removeByEmail: (email?: string) => Promise<boolean>;

}

/** @description `TagType` crud */
export interface db_tags extends db_crud<
  withConcreteIdAndHandle<TagTypeUpsert>, TagType
  > {
}

/** @description `CollectionType` crud */
export interface db_collections extends db_crud<
  withConcreteIdAndHandle<CollectionTypeUpsert>, 
  CollectionType
  > {

  /**
   * List and query the product in a collection
   * @param handle_or_id collection handle or id
   * @param query query
   */
  list_collection_products: (
    handle_or_id: HandleOrId, query: ApiQuery<ProductType>
  ) => Promise<Partial<ProductType>[]>

  /**
   * Count a collection's products items with a `query`
   * @param handle_or_id collection handle or id
   * @param query query
   */
  count_collection_products: (
    handle_or_id: HandleOrId, query: ApiQuery<ProductType>
  ) => Promise<number>;

  /**
   * List all the tags of products in a collection, This is helpful 
   * for building a filter system in the frontend if you know in advance 
   * all the tags of the products in a collection
   * 
   * @param handle_or_id collection handle or id
   */
  list_used_products_tags: (
    handle_or_id: HandleOrId
  ) => Promise<string[]>

}

/** @description `ProductType` crud */
export interface db_products extends db_crud<
  withConcreteIdAndHandle<ProductTypeUpsert> | 
  withConcreteIdAndHandle<VariantTypeUpsert>, 
  ProductType | VariantType
  > {

  /**
   * increment / decrement stock of multiple products
   * @param product_id_or_handles array of `id` or `handle`
   * @param deltas corresponding array of non-zero `positive` or 
   * `negative` integer
   */
  changeStockOfBy: (
    product_id_or_handles: HandleOrId[], deltas: number[]
  ) => Promise<boolean>;

  /**
   * List all of the tags of all the products deduped, This is helpful 
   * for building a filter system in the frontend if you know in advance 
   * all the tags of the products in a collection, also see the collection 
   * confined version 
   * {@link db_collections.list_used_products_tags}
   */
  list_used_products_tags: () => Promise<string[]>

}

/** @description `CustomerType` crud */
export interface db_customers extends OmitGetByHandle<db_crud<
  withConcreteIdAndHandle<CustomerTypeUpsert>, 
  CustomerType>> {
  getByEmail: (email: string) => Promise<CustomerType>;
  /**
   * 
   * @param customer_id the id of the customer (i.e `cus_sdino8dj8sdsd`)
   * @param query query object
   */
  list_customer_orders: (
    customer_id: ID, query?: ApiQuery<OrderData>
  ) => Promise<OrderData[]>;

  /**
   * Count a customer's orders items with a `query`
   * @param handle_or_id customer `email` or `id`
   * @param query query
   */
  count_customer_orders: (
    handle_or_id: HandleOrId, query?: ApiQuery<OrderData>
  ) => Promise<number>;

}

/** @description `StorefrontType` crud */
export interface db_storefronts extends db_crud<
  withConcreteIdAndHandle<StorefrontTypeUpsert>, 
  StorefrontType
  > {

  /**
   * Storecraft can generate a default automatcally generated storefront 
   * for you.
   * 
   * @returns the default auto generated storefront
   */
  get_default_auto_generated_storefront: () => Promise<StorefrontType>;
}

/** 
 * 
 * @description `ImageType` crud 
 */
export interface db_images extends db_crud<
  withConcreteIdAndHandle<ImageTypeUpsert>, 
  ImageType
    > {
  /**
   * report the media images
   * @param data a document that has `media`
   */
  report_document_media: (data: BaseType, extra: any) => Promise<void>;
}

/** 
 * 
 * @description `PostType` crud 
 */
export interface db_posts extends db_crud<
  withConcreteIdAndHandle<PostTypeUpsert>,
  PostType
  > {
}

/** @description `TemplateType` crud */
export interface db_templates extends db_crud<
  withConcreteIdAndHandle<TemplateTypeUpsert>, 
  TemplateType
> {
}

/** @description `ShippingMethodType` crud */
export interface db_shipping extends db_crud<
  withConcreteIdAndHandle<ShippingMethodTypeUpsert>, 
  ShippingMethodType
> {
}

/** @description `NotificationType` crud */
export interface db_notifications extends OmitGetByHandle<db_crud<
  withConcreteId<NotificationTypeUpsert & timestamps>, 
  NotificationType>
  > {
}

/** @description `DiscountType` crud */
export interface db_discounts extends db_crud<
  withConcreteIdAndHandle<DiscountTypeUpsert>, 
  DiscountType
  > {

  /**
   * List and query the products in a discount
   * @param handle_or_id discount handle or id
   * @param query query
   */
  list_discount_products: (
    handle_or_id: HandleOrId, query: ApiQuery<ProductType>
  ) => Promise<ProductType[]>

  /**
   * Count a discount's products items with a `query`
   * @param handle_or_id discount `handle` or `id`
   * @param query query
   */
  count_discount_products: (
    handle_or_id: HandleOrId, query: ApiQuery<ProductType>
  ) => Promise<number>;

  /**
   * List all the tags of all the products, that belong to a discount. 
   * This is helpful for building a filter system in the frontend if 
   * you know in advance all the tags of the products in a collection
   * 
   * @param handle_or_id discount `handle` or `id`
   */
  list_all_discount_products_tags: (
    handle_or_id: HandleOrId
  ) => Promise<string[]>

}

/** @description `OrderData` crud */
export interface db_orders extends OmitGetByHandle<db_crud<
  withConcreteIdAndHandle<OrderDataUpsert>, 
  OrderData>
  > {
}


export interface search {
  quicksearch: (query: ApiQuery) => Promise<QuickSearchResult>
}

export interface db_driver<ConfigType extends any = any> {
  /**
   * Init to the database
   */
  init: (app: App) => any | void;

  /** 
   * Disconnect the database if possible 
   */
  disconnect: () => Promise<boolean>;

  config?: ConfigType;

  /**
   * Is the driver ready ?
   */
  isReady: boolean;

  /**
   * Database name
   */
  name: string;

  /**
   * Get the underlying StoreCraft App
   */
  app: App | undefined;

  /**
   * The main `resources` and `tables`
   */
  resources?: {
    auth_users: db_auth_users;
    tags: db_tags;
    collections: db_collections;
    customers: db_customers;
    products: db_products;
    storefronts: db_storefronts;
    images: db_images;
    posts: db_posts;
    templates: db_templates;
    shipping_methods: db_shipping;
    notifications: db_notifications;
    discounts: db_discounts;
    orders: db_orders;
    search: search;
  }

}