import { 
  AuthUserType, CollectionType, CustomerType, 
  DiscountType, ImageType, NotificationType, 
  OrderData, 
  PostType, ProductType, ShippingMethodType, 
  StorefrontType, TagType } from "./types.api";
import { App, ParsedApiQuery } from "./types.public";

export type ID = string;
export type Handle = string;

type SearchTermsType = {
  /** A bunch of search terms to be queried by VQL boolean language */
  search?: string[];
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
  get: (id_or_handle: ID | Handle) => Promise<Partial<T>>;

  /**
   * get a single item by handle or id
   * @param handle 
   */
  getByHandle?: (handle: Handle) => Promise<Partial<T>>;

  /**
   * Insert or Replace an item
   * @param handle 
   */
  upsert: (data?: Partial<T> | Partial<T>[]) => Promise<void>;

  /**
   * Delete an item
   * @param handle 
   */
  remove: (handle?: Handle | ID) => Promise<void>

  /**
   * TBD
   * @returns 
   */
  list: (query: ParsedApiQuery) => Promise<Partial<T>[]>
}

/**
 * auth users crud
 */
export interface db_auth_users extends db_crud<AuthUserType> {
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
 * tags crud
 */
export interface db_collections extends db_crud<CollectionType & SearchTermsType> {
}

/**
 * customers crud
 */
export interface db_customers extends db_crud<CustomerType & SearchTermsType> {
}

/** products crud */
export interface db_products extends db_crud<ProductType & SearchTermsType> {
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
export interface db_shipping extends db_crud<ShippingMethodType & SearchTermsType> {
}

/** NotificationType crud */
export interface db_notifications extends db_crud<NotificationType & SearchTermsType> {
}

/** DiscountType crud */
export interface db_discounts extends db_crud<DiscountType & SearchTermsType> {
}

/** DiscountType crud */
export interface db_orders extends db_crud<OrderData & SearchTermsType> {
}

export interface db_driver {
  /**
   * Init to the database
   */
  init: (app: App<any, any>) => Promise<this>;

  /**
   * Database name
   */
  name: string;

  /** admins emails */
  admins_emails: string[]

  /**
   * Get the underlying StoreCraft App
   */
  app: App<any, any> | undefined;

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