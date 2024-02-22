import { 
  AuthUserType, BaseType, CollectionType, CollectionTypeUpsert, CustomerType, 
  CustomerTypeUpsert, 
  DiscountType, DiscountTypeUpsert, ImageType, ImageTypeUpsert, NotificationType, 
  NotificationTypeUpsert, 
  OrderData, 
  OrderDataUpsert, 
  PostType, PostTypeUpsert, ProductType, ProductTypeUpsert, ShippingMethodType, 
  ShippingMethodTypeUpsert, 
  StorefrontType, StorefrontTypeUpsert, TagType, 
  TagTypeUpsert, 
  idable, 
  searchable} from "./types.api.js";
import { App, ExpandQuery, ParsedApiQuery } from "./types.public.js";

export type ID = string;
export type Handle = string;
export type HandleOrId = string;

type SearchTermsType = {
  /** A bunch of search terms to be queried by VQL boolean language */
  search?: string[];
}

export type RegularGetOptions = {
  expand? : ExpandQuery;
}

export type idable_concrete = {
  id: string;
}

export type Aug = {
  search?: string[],
  created_at: string;
  updated_at: string;
}

/**
 * Basic collection or table
 */
export declare interface db_crud<U extends idable, G=U> {
  /** upsert type */
  $type_upsert?: U;
  /** get type */
  $type_get?: G;

  /**
   * get a single item by handle or id
   * @param id_or_handle 
   * @param options 
   */
  get: (id_or_handle: HandleOrId, options?: RegularGetOptions) => Promise<G>;
  /**
   * get bulk of items, ordered, if something is missing, `undefined`
   * should be instead
   * @param ids array of ids
   * @param options 
   */
  getBulk?: (ids: string[], options?: RegularGetOptions) => Promise<G[]>;

  /**
   * Insert or Replace an item
   */
  upsert: (data: U & searchable & idable_concrete) => Promise<void>;

  /**
   * Insert or Replace an item
   * @param handle 
   */
  upsertBulk?: (data: (U & searchable & idable_concrete)[]) => Promise<void>;

  /**
   * Delete an item
   * @param handle 
   */
  remove: (handle: HandleOrId) => Promise<void>

  /**
   * TBD
   * @returns 
   */
  list: (query: ParsedApiQuery) => Promise<G[]>
}

export type OmitGetByHandle<T> = Omit<T, 'getByHandle'>;

/**
 * auth users crud
 */
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
  removeByEmail: (email?: string) => Promise<void>;

}

/**
 * tags crud
 */
export interface db_tags extends db_crud<TagTypeUpsert, TagType> {
}

/**
 * collections crud
 */
export interface db_collections extends db_crud<CollectionTypeUpsert, CollectionType> {

  /**
   * List and query the product in a collection
   * @param handle_or_id collection handle or id
   * @param query query
   */
  list_collection_products: (handle_or_id: HandleOrId, query: ParsedApiQuery) => Promise<Partial<ProductType>[]>

}

/** products crud */
export interface db_products extends db_crud<ProductTypeUpsert, ProductType> {
  
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
   * @param product handle or id
   * @param options options like expand
   */
  list_product_variants: (product: HandleOrId) => Promise<ProductType[]>;
  
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

/**
 * customers crud
 */
export interface db_customers extends OmitGetByHandle<db_crud<CustomerTypeUpsert, CustomerType>> {
  getByEmail: (email: string) => Promise<CustomerType>;
}

/** StorefrontData crud */
export interface db_storefronts extends db_crud<StorefrontTypeUpsert, StorefrontType> {
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

/** ImageType crud */
export interface db_images extends db_crud<ImageTypeUpsert, ImageType> {
  /**
   * report the media images
   * @param data a document that has `media`
   */
  report_document_media: (data: BaseType) => Promise<void>;
}

/** PostType crud */
export interface db_posts extends db_crud<PostTypeUpsert, PostType> {
}

/** ShippingMethodType crud */
export interface db_shipping extends db_crud<ShippingMethodTypeUpsert, ShippingMethodType> {
}

/** NotificationType crud */
export interface db_notifications extends OmitGetByHandle<db_crud<NotificationTypeUpsert, NotificationType>> {
}

/** DiscountType crud */
export interface db_discounts extends db_crud<DiscountTypeUpsert, DiscountType> {

  /**
   * List and query the products in a discount
   * @param handle_or_id discount handle or id
   * @param query query
   */
  list_discount_products: (handle_or_id: HandleOrId, query: ParsedApiQuery) => Promise<ProductType[]>
}

/** OrderData crud */
export interface db_orders extends OmitGetByHandle<db_crud<OrderDataUpsert, OrderData>> {

  /**
   * 
   * @param customer_id the id of the customer (i.e `cus_sdino8dj8sdsd`)
   * @param query query object
   */
  list_customer_orders: (customer_id: ID, query: ParsedApiQuery) => Promise<OrderData[]>;
}

export interface db_driver {
  /**
   * Init to the database
   */
  init: (app: App<any, any, any>) => Promise<this>;

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
  app: App<any, any, any> | undefined;

  // controllers
  auth_users: db_auth_users;
  tags: db_tags;
  collections: db_collections;
  customers: db_customers;
  products: db_products;
  storefronts: db_storefronts;
  images: db_images;
  posts: db_posts;
  shipping: db_shipping;
  notifications: db_notifications;
  discounts: db_discounts;
  orders: db_orders;
}