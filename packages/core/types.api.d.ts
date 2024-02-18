import { PaymentOptionsEnum } from "./types.api.enums.js";
import { PaymentGatewayStatus } from "./types.payments.js";

/** Base properties */
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
  /** Search terms, usually computed by backend */
  search?: string[];
  [x: string] : any;
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

export type ApiAuthSigninType = AuthBaseType;
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
  published?: string;
}

// products

/** A tuple of option id and selected value id */
export type VariantCombination = {
  /** a list of selection of option and value */
  selection: VariantOptionSelection[];
  /** the product data associated with this variant */
  product: ProductType;
}

/** The data of a variant option */
export type VariantOption = {
  /** variant option name (for example 'Size') */
  name: string;
  /** variant option id */
  id: string;
  /** variant option values (for example 'Small' / 'Medium' / 'Large' ..) */
  values: TextEntity[];
}

export type TextEntity = {
  /** the id of the entity */
  id: string;
  /** the text value of the entity */
  value: string;
}

export type VariantOptionSelection = {
  /** Variant option id */
  option_id: string;
  /** Variant selected value id */
  value_id: string;
}

export type ProductType = BaseType & {
  /** the key name */
  handle: string;
  /** title of collection */
  title: string;
  /** status */
  active: boolean;
  /** collections, upon insert, should have at least id field */
  collections?: Partial<CollectionType>[];
  /** video media url */
  video?: string;
  /** 
   * price 
   * @minimum 0
   */
  price: number;
  /** 
   * integer stock quantity 
   * @minimum 0
   */
  qty: number;
  /** 
   * compare at price point 
   * @minimum 0
   */
  compare_at_price?: number;

  /** product variants */
  variants?: ProductType[]
  /** handle of parent product in case this product is a variant */
  parent_handle?: string;
  /** id of parent product in case this product is a variant */
  parent_id?: string;
  /** variants options info */
  variants_options?: VariantOption[];
  /** mapping of product variants handles to product data and variants options selection */
  variants_products?: Record<string, VariantCombination>
  /** Internal usage, clarifies the variant projected options */
  variant_hint?: VariantOptionSelection[];
  /** discounts we know were applied to this product */
  discounts?: Partial<DiscountType>[];
}

//

// discounts

export type DiscountType = BaseType & {
  /** title */
  title: string;
  /** discount code */
  handle: string;
  /** 
   * the order in which to apply the discounts stack (priority) 
   * @min 0
   */
  priority: number;
  /** the collection handle that contains the applicable discount products */
  published?: string;
  /** details and filters of the discount */
  info: DiscountInfo;
  /** discount application (automatic and coupons) */
  application: DiscountApplication;
}

/** details and filters of the discount */
export type DiscountInfo = {
  /** discount details */
  details: DiscountDetails;
  /** 
   * list of discount filters 
   * @minLength 1 You should Specify at least 1 Filter
   */
  filters: Filter[]
}

/** Discounts can be manual(coupon) or automatic types, see <a href='#DiscountApplicationEnum'>#DiscountApplicationEnum</a>  */
export type DiscountApplication = {
  /** 0 = Automatic, 1 = Manual */
  id: number;
  /** printable name */
  name: ('Automatic' | 'Manual');
  /** id name */  
  name2: ('automatic' | 'manual');
}

/** Discount filter scheme */
export type Filter = {
  /** meta data related to identifying the filter */
  meta: FilterMeta;
  /** the filter params */
  value: string[] | { from?: number, to:number} | { id?: string, handle?: string }[];
}

/** Filter meta data, see <a href='#FilterMetaEnum'>#FilterMetaEnum</a>  */
export type FilterMeta = {
  /** unique identifier for filter type */
  id: number;
  /** product or order filter */
  type: 'product' | 'order';
  /**  operation name id */
  op: 'p-in-collections' | 'p-not-in-collections' | 'p-in-handles' | 'p-not-in-handles' | 
  'p-in-tags' | 'p-not-in-tags' | 'p-all' | 'p_in_price_range' | 'o-subtotal-in-range' | 
  'o-items-count-in-range' | 'o-date-in-range' | 'o_has_customer';
  /** printable name */
  name: string;
}

/** The details of how to apply a discount. The type of discount and it's params */
export type DiscountDetails = {
  /** metadata to identify the type of discount */
  meta: DiscountMeta;
  /** extra parameters of the specific discount type */
  extra: RegularDiscountExtra|OrderDiscountExtra|BulkDiscountExtra|BuyXGetYDiscountExtra|BundleDiscountExtra;
}

/** Discount meta data, see <a href='#DiscountMetaEnum'>#DiscountMetaEnum</a>  */
export type DiscountMeta = {
  /** unique identifier of discount type (bulk, regular, order) */
  id: number;
  /** textual identifier */
  type: | 'regular' | 'bulk' | 'buy_x_get_y' | 'order' | 'bundle';
  /** printable name */
  name: string;
}

/** Parameters of a regular discount */
export type RegularDiscountExtra = {
  /** fixed price addition */
  fixed: number
  /** percents off */
  percent: number
}

/** Parameters of order discount */
export type OrderDiscountExtra = {
  /** fixed price addition */
  fixed: number
  /** percents off */
  percent: number
  /** do we have free shipping ? */
  free_shipping?: boolean;
}

/** Parameters of bulk discount */
export type BulkDiscountExtra = {
  /** fixed price addition */
  fixed: number
  /** percents off */
  percent: number
  /** the integer quantity for which the discount is given */
  qty: number
  /** apply the discount as many times as possible */
  recursive?: boolean
}

/** Parameters of bulk discount */
export type BuyXGetYDiscountExtra = {
  /** fixed price addition */
  fixed: number
  /** percents off */
  percent: number
  /** the integer quantity of BUY X */
  qty_x: number
  /** the integer quantity of BUY Y */
  qty_y: number
  /** The filters for what a customer gets (Y) */
  filters_y: Filter[];
  /** apply the discount as many times as possible */
  recursive?: boolean
}

/** Parameters of bulk discount */
export type BundleDiscountExtra = {
  /** fixed price addition */
  fixed: number
  /** percents off */
  percent: number
  /** apply the discount as many times as possible */
  recursive?: boolean
}

// storefront

export type StorefrontType = BaseType & {
  /** readable handle */
  handle: string;
  /** readable title */
  title: string;
  /** video url */
  video?: string;
  /** exported storefront json */
  published?: string;
  /** Handles of collections part of the storefront */
  collections?: Partial<CollectionType>[];
  /** Handles of products you want to promote as part of the storefront */
  products?: Partial<ProductType>[];
  /** Handles of shipping methods part of the storefront */
  shipping_methods?: Partial<ShippingMethodType>[];
  /** Handles of discounts to prmote part of the storefront */
  discounts?: Partial<DiscountType>[];
  /** Handles of posts to prmote part of the storefront */
  posts?: Partial<PostType>[];
}


//

export type AddressType = {
  /** first name of recipient */
  firstname?: string;
  /** last name of recipient */
  lastname?: string;
  /**
   * The phone number
   * @pattern ^([+]?d{1,2}[-s]?|)d{3}[-s]?d{3}[-s]?d{4}$ Invalid phone number
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
  /** The auth id */
  auth_id?: string;
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
}

// image

export type ImageType = BaseType & {
  /** unique handle */
  handle: string;
  /** name */
  name: string;
  /** it's published public url */
  url: string;
  /** List of assets using this image */
  usage?: string[];
}

// shipping


export type ShippingMethodType = BaseType & {
  /**
   * shipping method price
   * @minimum 0 Please set a price >= 0
   */
  price: number;
  /** name */
  name: string;
}


// posts

export type PostType = BaseType & {
  /** unique handle */
  handle: string;
  /** title of post */
  title: string;
  /** rich text of post */
  text: string;
}


// settings



export type SettingsType = BaseType & {

}


// notifications

export type NotificationType = BaseType & {
  /** message of notification, can be markdown, markup or plain text */
  message: string;
  /** author of the notification */
  author?: string;
  /** list of actions */
  actions?: NotificationAction[];
}

/** each notification may have an actionable item associated with it. For example, clicking an order notification will route to the order page at Shelf */
export type NotificationAction = {
  /** Name of the action */
  name?: string;
  /** the type of action */
  type?: NotificationActionType;
  /** extra params for the actions type */
  params?: NotificationActionRouteParams | NotificationActionUrlParams | any;
}

/** 'route' means routing inside shelfm 'url' is linking to a url */
export type NotificationActionType = 'route' | 'url' | string;

/** route inside shelf action params */
export type NotificationActionRouteParams = {
  /** which collection */
  collection: string;
  /** which document */
  document: string;
}

/** Action params for actions of type 'url' */
export type NotificationActionUrlParams = {
  /** open the url in new window */
  new_window: boolean;
  /** the url to open */
  url: string;
}


// order types

export type OrderData = BaseType & {
  /** status of checkout, fulfillment and payment */
  status: OrderStatus; 
  /** buyer info */
  contact: OrderContact;
  /** shipping address info */
  address: AddressType;
  /** line items is a list of the purchased products */
  line_items: LineItem[];
  /** notes for the order */
  notes: string; 
  /** shipping method info */
  shipping_method: ShippingMethodType; 
  /** a list of manual coupons */
  coupons: DiscountType[]; 
  /** pricing information */
  pricing: PricingData;
  /** in case the order went through validation  */
  validation?: ValidationEntry[];
  /** payment gateway info and status */
  payment_gateway: OrderPaymentGatewayData; 
}

export type CheckoutData = {

}

/** Order buyer info */
export type OrderContact = {
  firstname?: string;
  lastname?: string;
  phone_number?: string;
  email?: string;
  customer_id?: string;
}

/** status of checkout, fulfillment and payment */
export type OrderStatus = {
  checkout: CheckoutStatusOptions;
  payment: PaymentStatusOptions;
  fulfillment: FulfillStatusOptions;
}

/** Fulfillment options encapsulate the current state, see <a href='#FulfillOptionsEnum'>#FulfillOptionsEnum</a>  */
export type FulfillStatusOptions = {
  /** 0-draft, 1-processing, 2-shipped, 3-fulfilled, 4-cancelled */
  id: number;
  /** readable/printable name */
  name: string;
  /** unique name (like id) */
  name2: 'draft' | 'processing' | 'shipped' | 'fulfilled' | 'cancelled';

}


/** Payment options encapsulate the current state, see <a href='#PaymentOptionsEnum'>#PaymentOptionsEnum</a>  */
export type PaymentStatusOptions = {
  /** 0-unpaid, 1-captured, 2-requires_auth, 3-requires_auth, 4-voided, 5-failed, 6-partially_paid, 7-refunded */
  id: number;
  /** readable/printable name */
  name: string;
  /** unique name (like id) */
  name2: 'unpaid' | 'authorized' | 'captured' | 'requires_auth' | 'voided' | 'partially_paid' | 'refunded' | 'partially_refunded';

}

/** Checkout status encapsulate the current state, see <a href='#CheckoutStatusEnum'>#CheckoutStatusEnum</a>  */
export type CheckoutStatusOptions = {
  /** 0-created, 1-requires_action, 2-failed, 3-complete */
  id: number;
  /** readable/printable name */
  name: string;
  /** unique name (like id) */
  name2: 'created' | 'requires_action' | 'failed' | 'complete';
}


/** Pricing object exaplins how the pricing of an order was calculated given a stack of automatic discounts, coupons, line items and shipping method */
export type PricingData = {
  /** explanation of how discounts stack and change pricing */
  evo: EvoEntry[]; 
  /** selected shipping method */
  shipping_method: ShippingMethodType;
  /** subtotal of items price before discounts */
  subtotal_undiscounted: number; 
  /** sum of all discounts at all stages */
  subtotal_discount: number; 
  /** subtotal_undiscounted - subtotal_discount */
  subtotal: number; 
  /** subtotal + shipping */
  total: number; 
  /** how many items are eligible */
  quantity_total: number; 
  /** how many items were discounted */
  quantity_discounted: number;
  /** authentication user id */
  uid?: string; 
  errors: DiscountError[];
 
}


/** A line item is a product, that appeared in an order */
export type LineItem = {
  /**  id or handle of product */
  id: string;
  /** it's known price */
  price?: number; 
  /** integer quantity of how many such products were bought */
  qty: number;
  /** used by order to indicate it has reserved stock and it's amount */
  stock_reserved?: number; 
  /** (optional) the product data */
  data?: ProductType;
}

export type DiscountError = {
  discount_code: string;
  message: string;
}

/** Explain how a specific discount was used to discount line items */
export type EvoEntry = {
  discount?: DiscountType;
  /** the discount code */
  discount_code?: string;
  /** the amount of money that was discounted by this discount */
  total_discount?: number;
  /** how many items are left to discount */
  quantity_undiscounted?: number;
  /** how many items were discounted now */
  quantity_discounted?: number;
  /** running subtotal without shipping */
  subtotal?: number;
  /** running total */
  total?: number;
  /**  available line items after discount */
  line_items?: LineItem[];
}
/** checkouts or draft orders might be validated in automatic systems */
export type ValidationEntry = {
  id: string;
  title?: string;
  message?: 'out-of-stock' | 'not-enough-stock' | 'some-stock-is-on-hold';
}

/** How did the order interacted with a payment gateway ?  */
export type OrderPaymentGatewayData = {
  /** the payment gateway identifier */
  gateway_handle: string;
  /** result of gateway at checkout creation */
  on_checkout_create?: any;
  /** latest status of payment for caching */
  latest_status?: PaymentGatewayStatus; 
}
