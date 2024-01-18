

/**
 * base type
 */
type BaseType = {
  updatedAt?: Date;
  createdAt?: Date;
  id?: string;
}

// auth

export type AuthBaseType = {
  /**
   * @format email
   */
  email: string;
  /**
   * @minLength 4
   * @maxLength 20   
   */
  password: string;
}

export declare enum Role {
  admin='admin',
}

export type ApiAuthLoginType = AuthBaseType;
export type ApiAuthSignupType = AuthBaseType;
export type ApiAuthRefreshType = {
  refresh_token: string;
}

export type AuthUserType = BaseType & AuthBaseType & {
  confirmed_mail: boolean
  roles: Role[];
}

export type AddressType = BaseType & {
  /** first name of recipient */
  firstname?: string;
  /** last name of recipient */
  lastname?: string;
  /** phone number */
  phone_number?: string;
  /** optional company name of recipient */
  company?: string;
  /** street address 1 */
  street1?: string;
  /** street address 2 */
  street2?: string;
  /** city */
  city?: string;
  /** country */
  country?: string;
  /** state */
  state?: string;
  /** zip code */
  zip_code?: string;
  /** postal code */
  postal_code?: string;  
}

export type CustomerType = BaseType & {
  /** firstname */
  firstname: string;
  /** lastname */
  lastname: string;
  /** email address */
  email: string;
  /** phone number */
  phone_number?: string;
  /** address info */
  address?: AddressType;
  /** list of tags , example ['likes_games', 'subscribed_false', ...] */
  tags: string[];
  /** simple search index */
  search_index?: string[];
}
