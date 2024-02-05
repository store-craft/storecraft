import { 
  AuthUserType, CollectionType, CustomerType, 
  DiscountType, ImageType, NotificationType, 
  OrderData, 
  PostType, ProductType, ShippingMethodType, 
  StorefrontType, TagType } from "./types.api";
import { App, ExpandQuery, ParsedApiQuery } from "./types.public";

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

/**
 * Basic collection or table
 */
export declare interface db_crud<T> {
  $type?: T;

  /**
   * get a single item by handle or id
   * @param id_or_handle 
   */
  get: (id_or_handle: HandleOrId, options?: RegularGetOptions) => Promise<Partial<T>>;

  /**
   * Insert or Replace an item
   */
  upsert: (data?: Partial<T>) => Promise<void>;

  /**
   * Insert or Replace an item
   * @param handle 
   */
  upsertBulk?: (data?: Partial<T>[]) => Promise<void>;

  /**
   * Delete an item
   * @param handle 
   */
  remove: (handle?: HandleOrId) => Promise<void>

  /**
   * TBD
   * @returns 
   */
  list: (query: ParsedApiQuery) => Promise<Partial<T>[]>
}

export type OmitGetByHandle<T> = Omit<T, 'getByHandle'>;

/**
 * auth users crud
 */
export interface db_auth_users extends OmitGetByHandle<db_crud<AuthUserType>> {
  /**
   * get by email
   * @param handle 
   */
  getByEmail: (email?: string) => Promise<AuthUserType>;
}

/**
 * tags crud
 */
export interface db_tags extends db_crud<TagType & SearchTermsType> {
}

/**
 * collections crud
 */
export interface db_collections extends db_crud<CollectionType & SearchTermsType> {

  /**
   * 
   * @param handle_or_id collection handle or id
   * @param query query
   */
  list_products: (handle_or_id: HandleOrId, query: ParsedApiQuery) => Promise<Partial<ProductType>[]>

}

/**
 * customers crud
 */
export interface db_customers extends OmitGetByHandle<db_crud<CustomerType & SearchTermsType>> {
}

/** products crud */
export interface db_products extends db_crud<ProductType & SearchTermsType> {
  
  /**
   * list all of the product related collections, returns eveything, this is not query based,
   * we assume, there are a handful of collection per product
   * @param product handle or id
   * @param options options like expand
   */
  list_product_collections: (product: HandleOrId) => Promise<Partial<CollectionType>[]>;

  /**
   * list all of the product related collections, returns eveything, this is not query based,
   * we assume, there are a handful of collection per product
   * @param product handle or id
   * @param options options like expand
   */
  list_product_variants: (product: HandleOrId) => Promise<Partial<ProductType>[]>;
  
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

/** StorefrontData crud */
export interface db_storefronts extends db_crud<StorefrontType & SearchTermsType> {
}

/** ImageType crud */
export interface db_images extends db_crud<ImageType & SearchTermsType> {
}

/** PostType crud */
export interface db_posts extends db_crud<PostType & SearchTermsType> {
}

/** ShippingMethodType crud */
export interface db_shipping extends OmitGetByHandle<db_crud<ShippingMethodType & SearchTermsType>> {
}

/** NotificationType crud */
export interface db_notifications extends OmitGetByHandle<db_crud<NotificationType & SearchTermsType>> {
}

/** DiscountType crud */
export interface db_discounts extends db_crud<DiscountType & SearchTermsType> {
}

/** DiscountType crud */
export interface db_orders extends OmitGetByHandle<db_crud<OrderData & SearchTermsType>> {
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

  /** admins emails */
  admins_emails: string[]

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