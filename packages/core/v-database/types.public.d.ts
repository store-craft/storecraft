import { 
  AuthUserType, BaseType, CollectionType, 
  CustomerType, DiscountType, ImageType, 
  NotificationType, OrderData, PostType, 
  ProductType, ShippingMethodType, StorefrontType, 
  TagType, VariantType, searchable} from "../v-api/types.api.js";
import type { ExpandQuery, ApiQuery } from "../v-api/types.api.query.js";
import type { App } from '../types.public.js'

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
export declare interface db_crud<U extends idable_concrete, G=U> {
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
   * @param data 
   * @param [search_terms] array of search terms realte to the item
   */
  upsert: (data: U & idable_concrete, search_terms?: string[]) => Promise<boolean>;

  /**
   * TODO: remove and put only in notifications
   * bulk upsert 
   * @param data 
   * @param search_terms 
   * @returns 
   */
  upsertBulk?: (data: (U & idable_concrete)[], search_terms: string[][]) => Promise<boolean>;

  /**
   * Delete an item
   * @param id_or_handle 
   */
  remove: (id_or_handle: HandleOrId) => Promise<boolean>

  /**
   * TBD
   * @returns 
   */
  list: (query: ApiQuery) => Promise<G[]>
}

export type OmitGetByHandle<T> = Omit<T, 'getByHandle'>;

/**
 * auth users crud
 */
export interface db_auth_users extends OmitGetByHandle<db_crud<AuthUserType & idable_concrete>> {
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

/**
 * tags crud
 */
export interface db_tags extends db_crud<TagType & idable_concrete, TagType> {
}

/**
 * collections crud
 */
export interface db_collections extends db_crud<CollectionType & idable_concrete, CollectionType> {

  /**
   * List and query the product in a collection
   * @param handle_or_id collection handle or id
   * @param query query
   */
  list_collection_products: (handle_or_id: HandleOrId, query: ApiQuery) => Promise<Partial<ProductType>[]>

}

/** products crud */
export interface db_products extends db_crud<(ProductType & VariantType) & idable_concrete, ProductType & VariantType> {
  
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
  list_product_variants: (product: HandleOrId) => Promise<VariantType[]>;
  
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
export interface db_customers extends OmitGetByHandle<db_crud<CustomerType & idable_concrete, CustomerType>> {
  getByEmail: (email: string) => Promise<CustomerType>;
  /**
   * 
   * @param customer_id the id of the customer (i.e `cus_sdino8dj8sdsd`)
   * @param query query object
   */
  list_customer_orders: (customer_id: ID, query: ApiQuery) => Promise<OrderData[]>;
}

/** StorefrontData crud */
export interface db_storefronts extends db_crud<StorefrontType & idable_concrete, StorefrontType> {
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
export interface db_images extends db_crud<ImageType & idable_concrete, ImageType> {
  /**
   * report the media images
   * @param data a document that has `media`
   */
  report_document_media: (data: BaseType, extra: any) => Promise<void>;
}

/** PostType crud */
export interface db_posts extends db_crud<PostType & idable_concrete, PostType> {
}

/** ShippingMethodType crud */
export interface db_shipping extends db_crud<ShippingMethodType & idable_concrete, ShippingMethodType> {
}

/** NotificationType crud */
export interface db_notifications extends OmitGetByHandle<db_crud<NotificationType & idable_concrete, NotificationType>> {
}

/** DiscountType crud */
export interface db_discounts extends db_crud<DiscountType & idable_concrete, DiscountType> {

  /**
   * List and query the products in a discount
   * @param handle_or_id discount handle or id
   * @param query query
   */
  list_discount_products: (handle_or_id: HandleOrId, query: ApiQuery) => Promise<ProductType[]>
}

/** OrderData crud */
export interface db_orders extends OmitGetByHandle<db_crud<OrderData & idable_concrete, OrderData>> {

}

export interface db_driver {
  /**
   * Init to the database
   */
  init: (app: App<any, any, any>) => Promise<this>;
  /** Disconnect the database if possible */
  disconnect: () => Promise<boolean>;

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