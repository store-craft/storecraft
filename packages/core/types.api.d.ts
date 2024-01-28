
/**
 * base type
 */
type BaseType = {
  updated_at?: string;
  created_at?: string;
  id?: string;
  /** List of images urls */
  media?: string[];
  /** List of attributes */
  attributes?: AttributeType[];
  /** list of tags , example ['genere_action', 'rated_M', ...] */
  tags?: string[];
  /** Rich description */
  desc?: string;
  /** Is the entity active ? */
  active?: boolean;
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

export type Role2 = {
  admin: {
    type: 'admin'
  },
  user: {
    type: 'user'
  },
}

export type Role = 'admin' | 'user' | string;

export type ApiAuthLoginType = AuthBaseType;
export type ApiAuthSignupType = AuthBaseType;
export type ApiAuthRefreshType = {
  refresh_token: string;
}

export type AuthUserType = BaseType & AuthBaseType & {
  confirmed_mail?: boolean
  roles?: Role[];
}

// attributes

export type AttributeType = {
  key: string;
  value?: string;
}


// tag type

export type TagType = BaseType & {
  /** the key name */
  handle: string;
  /** list of values */
  values: string[];
  /** rich description */
  desc?: string;
}

// collections

export type CollectionType = BaseType & {
  /** the key name */
  handle: string;
  /** title of collection */
  title: string;
  /** status */
  active: boolean;
  /** published json url */
  _published?: string;
}

//

export type AddressType = BaseType & {
  /** first name of recipient */
  firstname?: string;
  /** last name of recipient */
  lastname?: string;
  /**
   * The phone number
   * @pattern ^([+]?d{1,2}[-s]?|)d{3}[-s]?d{3}[-s]?d{4}$
   */  
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
  /**
   * @format email
   */
  email: string;
  /**
   * The phone number
   * @pattern ^([+]?d{1,2}[-s]?|)d{3}[-s]?d{3}[-s]?d{4}$
   */  
  phone_number?: string;
  /** address info */
  address?: AddressType;
  /** list of tags , example ['likes_games', 'subscribed_false', ...] */
  tags: string[];
  /** simple search index */
  search_index?: string[];
}
