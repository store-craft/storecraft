// Query types
export type ApiQuerySortOrder = 'asc' | 'desc';

/**
 * Query url base type for most collections
 */
export type ApiQueryBaseURL = {
  /**
   * boolean DSL for filtering the terms
   * (whatever-indexed tag:a -(tag:b | tag:c) handle:product*)
   */
  q?: string;
  /**
   * order of the query:
   * 1. If startAt/endAt=(updated:2012..), it will order by `updated_at`
   * 2. if startAt===undefined, it will sort by `updated_at`
   * 3. If startAt/endAt=(created:2012..), it will order by `created_at`
   */
  order?: ApiQuerySortOrder;
  /**
   * limit of items returned
   */
  limit?: number;
  /**
   * (updated:2012-09)
   * (updated:2012-09,id:aokaoskox)
   * (created:2012-09,id:aokaoskox)
   */
  startAt?: [
    a:number, b:string
  ]
  startAfter?: string;
  /**
   * (updated:2012-09)
   * (updated:2012-09,id:aokaoskox)
   * (created:2012-09,id:aokaoskox)
   */
  endAt?: string;
  endBefore?: string;
}

/**
 * Query url base type for most collections
 */
export type ApiQuery = {
  /**
   * boolean DSL for filtering the terms
   * (whatever-indexed tag:a -(tag:b | tag:c) handle:product*)
   */
  q?: string;
  /**
   * order of the query:
   * 1. If startAt/endAt=(updated:2012..), it will order by `updated_at`
   * 2. if startAt===undefined, it will sort by `updated_at`
   * 3. If startAt/endAt=(created:2012..), it will order by `created_at`
   */
  order?: ApiQuerySortOrder;
  /**
   * limit of items returned
   */
  limit?: number;
  /**
   * (updated:2012-09)
   * (updated:2012-09,id:aokaoskox)
   * (created:2012-09,id:aokaoskox)
   */
  startAt?: string;
  startAfter?: string;
  /**
   * (updated:2012-09)
   * (updated:2012-09,id:aokaoskox)
   * (created:2012-09,id:aokaoskox)
   */
  endAt?: string;
  endBefore?: string;
}

/**
 * base type
 */
type BaseType = {
  updated_at?: string;
  created_at?: string;
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

// tag type

export type TagType = BaseType & {
  /** the key name */
  handle: string;
  /** list of values */
  values: string[];
  /** rich description */
  desc?: string;
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
