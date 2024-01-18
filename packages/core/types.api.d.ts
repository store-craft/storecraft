

/**
 * base type
 */
type BaseType = {
  updatedAt?: Date;
  createdAt?: Date;
  id?: string;
}

export type AuthUserType = BaseType & {
  email?: string;
  password?: string; // hashed
  confirmed_mail?: boolean
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
