import { AuthUserType, CustomerType } from "./types.api";
import { App } from "./types.public";

export type Handle = string;

/**
 * Basic collection or table
 */
export declare interface db_crud<T> {
  /**
   * get a single item by handle
   * @param handle 
   */
  get: (handle?: Handle) => Promise<T>;

  /**
   * set a single item by handle
   * @param handle 
   */
  upsert: (data?: T) => Promise<void>;

  /**
   * Delete an item
   * @param handle 
   */
  remove: (handle?: Handle) => Promise<void>

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
   * Get the underlying StoreCraft App
   */
  app: App<any, any> | undefined;

  /** CRUD authenticated users */
  auth_users: db_auth_users;
  
  /** CRUD customers */
  customers: db_customers;
}