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
import type { ExpandQuery, ApiQuery } from "../api/types.api.query.d.ts";
import type { App } from '../types.public.d.ts'

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
export type withConcreteIdAndHandle<T> = Omit<T, 'id' | 'handle'> & { id: string, handle: string};

/**
 * @description Basic collection or table
 */
// export declare interface db_crud<U extends idable, G extends idable=U> {
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
  get: (id_or_handle: HandleOrId, options?: RegularGetOptions<G>) => Promise<G>;
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
export interface db_tags extends db_crud<withConcreteIdAndHandle<TagTypeUpsert>, TagType> {
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
   * List all the tags of products in a collection, This is helpful for building
   * a filter system in the frontend if you know in advance all the tags of the products
   * in a collection
   * @param handle_or_id collection handle or id
   * @param query query
   */
  list_collection_products_tags: (
    handle_or_id: HandleOrId
  ) => Promise<string[]>

}

/** @description `ProductType` crud */
export interface db_products extends db_crud<
  withConcreteIdAndHandle<ProductTypeUpsert> | withConcreteIdAndHandle<VariantTypeUpsert>, 
  ProductType | VariantType> {

  /**
   * increment / decrement stock of multiple products
   * 
   * @param product_id_or_handles array of `id` or `handle`
   * @param deltas corresponding array of non-zero `positive` or `negative` integer
   */
  changeStockOfBy: (product_id_or_handles: HandleOrId[], deltas: number[]) => Promise<void>;

  /**
   * list all of the product related collections, returns eveything, this is not query based,
   * we assume, there are a handful of collection per product
   * @param product handle or id
   * @param options options like expand
   */
  list_product_collections: (product: HandleOrId) => Promise<CollectionType[]>;

  /**
   * list all of the product related discounts, returns eveything, this is not query based,
   * we assume, there are a handful of discounts per product
   * @param product handle or id
   * @param options options like expand
   */
  list_product_discounts: (product: HandleOrId) => Promise<DiscountType[]>;

  /**
   * list all of the product related collections, returns eveything, this is not query based,
   * we assume, there are a handful of collection per product
   * 
   * @param product handle or id
   * @param options options like expand
   */
  list_product_variants: (product: HandleOrId) => Promise<VariantType[]>;
  
  /**
   * list all of the product related collections, returns eveything, this is not query based,
   * we assume, there are a handful of collection per product
   * 
   * @param product handle or id
   * @param options options like expand
   */
  list_related_products: (product: HandleOrId) => Promise<BaseProductType[]>;
  
  
  /**
   * Add product to collection
   * @param product handle or id
   * @param collection_handle_or_id collection handle or id
   */
  add_product_to_collection?: (product: HandleOrId, collection_handle_or_id: HandleOrId) => Promise<void>;

  /**
   * remove product from collection
   * @param product handle or id
   * @param collection_handle_or_id collection handle or id
   */
  remove_product_from_collection?: (product: HandleOrId, collection_handle_or_id: HandleOrId) => Promise<void>;

}

/** @description `CustomerType` crud */
export interface db_customers extends OmitGetByHandle<db_crud<
  withConcreteId<CustomerTypeUpsert>, 
  CustomerType>> {
  getByEmail: (email: string) => Promise<CustomerType>;
  /**
   * 
   * @param customer_id the id of the customer (i.e `cus_sdino8dj8sdsd`)
   * @param query query object
   */
  list_customer_orders: (
    customer_id: ID, query: ApiQuery<OrderData>
  ) => Promise<OrderData[]>;
}

/** @description `StorefrontType` crud */
export interface db_storefronts extends db_crud<
  withConcreteIdAndHandle<StorefrontTypeUpsert>, 
  StorefrontType
  > {
  /**
   * list all of the product related to storefront, returns eveything, this is not query based,
   * we assume, there are a handful.
   * @param handle_or_id handle or id
   * @param options options like expand
   */
  list_storefront_products: (handle_or_id: HandleOrId) => Promise<ProductType[]>;
  /**
   * list all of the collections related to storefront, returns eveything, this is not query based,
   * we assume, there are a handful.
   * @param handle_or_id handle or id
   * @param options options like expand
   */
  list_storefront_collections: (handle_or_id: HandleOrId) => Promise<CollectionType[]>;
  /**
   * list all of the discounts related to storefront, returns eveything, this is not query based,
   * we assume, there are a handful.
   * @param handle_or_id handle or id
   * @param options options like expand
   */
  list_storefront_discounts: (handle_or_id: HandleOrId) => Promise<DiscountType[]>;
  /**
   * list all of the shipping methods related to storefront, returns eveything, this is not query based,
   * we assume, there are a handful.
   * @param handle_or_id handle or id
   * @param options options like expand
   */
  list_storefront_shipping_methods: (handle_or_id: HandleOrId) => Promise<ShippingMethodType[]>;
  /**
   * list all of the posts related to storefront, returns eveything, this is not query based,
   * we assume, there are a handful.
   * @param handle_or_id handle or id
   * @param options options like expand
   */
  list_storefront_posts: (handle_or_id: HandleOrId) => Promise<PostType[]>;

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
}

/** @description `OrderData` crud */
export interface db_orders extends OmitGetByHandle<db_crud<
  withConcreteId<OrderDataUpsert>, 
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