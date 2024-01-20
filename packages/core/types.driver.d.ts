import { AuthUserType, CustomerType, TagType } from "./types.api";
import { App } from "./types.public";

export type ID = string;
export type Handle = string;

/**
 * Basic collection or table
 */
export declare interface db_crud<T> {
  /**
   * get a single item by handle or id
   * @param handle 
   */
  get: (id: ID) => Promise<T>;

  /**
   * get a single item by handle or id
   * @param handle 
   */
  getByHandle: (handle: Handle) => Promise<T>;

  /**
   * set a single item by handle
   * @param handle 
   */
  upsert: (data?: T) => Promise<void>;

  /**
   * Delete an item
   * @param handle 
   */
  remove: (handle?: Handle | ID) => Promise<void>

  /**
   * TBD
   * @returns 
   */
  list: () => Promise<T[]>
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
export interface db_tags extends db_crud<TagType> {
}

/**
 * customers crud
 */
export interface db_customers extends db_crud<CustomerType> {
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

  /** CRUD authenticated users */
  auth_users: db_auth_users;

  /** CRUD authenticated users */
  tags: db_tags;

  /** CRUD customers */
  customers: db_customers;
}