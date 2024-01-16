
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
  set: (handle?: Handle, data?: T) => Promise<T>;

  /**
   * Create a new item
   * @param data 
   */
  create: (data?: T) => Promise<Handle>;

  /**
   * Delete an item
   * @param handle 
   */
  delete: (handle?: Handle) => Promise<void>

  /**
   * TBD
   * @returns 
   */
  list: () => Promise<T[]>
}

/**
 * base type
 */
type BaseType = {
  updatedAt: Date;
  createdAt: Date;
  id?: string;
}

export type AuthUserType = BaseType & {
  email: string;
  password: string; // hashed
  confirmed_mail: boolean
}

export type CustomerType = BaseType & {
  email: string;
}

export declare interface db_auth_users extends db_crud<AuthUserType> {
}
