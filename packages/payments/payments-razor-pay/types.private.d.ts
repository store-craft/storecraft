/**
 * razorpay order as returned by the create order api
 * https://razorpay.com/docs/api/orders/create/
 */
export type razorpay_order = {
  /** unique razorpay order id, e.g. order_XXXXXXXXXXXXXX */
  id: string;
  /** entity type, always "order" */
  entity: string;
  /** amount in smallest currency unit (paise for INR) */
  amount: number;
  /** amount paid so far */
  amount_paid: number;
  /** amount due */
  amount_due: number;
  /** iso 4217 currency code, e.g. "INR" */
  currency: string;
  /** receipt identifier you passed in */
  receipt: string | null;
  /** offer id if any */
  offer_id: string | null;
  /** created | attempted | paid */
  status: 'created' | 'attempted' | 'paid';
  /** number of payment attempts */
  attempts: number;
  /** unix timestamp of creation */
  created_at: number;
  /** key-value notes */
  notes: Record<string, string>;
};

/**
 * razorpay payment as returned by fetch payment api
 * https://razorpay.com/docs/api/payments/fetch/
 */
export type razorpay_payment = {
  /** unique payment id, e.g. pay_XXXXXXXXXXXXXX */
  id: string;
  entity: string;
  amount: number;
  currency: string;
  /** created | authorized | captured | refunded | failed */
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
  order_id: string;
  invoice_id: string | null;
  international: boolean;
  method: string;
  amount_refunded: number;
  refund_status: string | null;
  captured: boolean;
  description: string | null;
  card_id: string | null;
  bank: string | null;
  wallet: string | null;
  vpa: string | null;
  email: string;
  contact: string;
  notes: Record<string, string>;
  fee: number | null;
  tax: number | null;
  error_code: string | null;
  error_description: string | null;
  created_at: number;
};

/**
 * razorpay refund as returned by the refund api
 * https://razorpay.com/docs/api/refunds/
 */
export type razorpay_refund = {
  /** unique refund id, e.g. rfnd_XXXXXXXXXXXXXX */
  id: string;
  entity: string;
  amount: number;
  currency: string;
  payment_id: string;
  notes: Record<string, string>;
  receipt: string | null;
  batch_id: string | null;
  /** pending | processed | failed */
  status: 'pending' | 'processed' | 'failed';
  /** normal | optimum */
  speed_requested: string;
  /** instant | normal */
  speed_processed: string;
  /**
   * dynamic array of bank reference numbers (arn, rrn, utr).
   * provided by the banking partner after the refund is processed.
   */
  acquirer_data: Record<string, string | null>;
  created_at: number;
};

/**
 * shape of the object we return from onCheckoutCreate and pass around
 * in all subsequent gateway interactions
 */
export type CheckoutCreateResult = {
  /** razorpay order id */
  razorpay_order_id: string;
  /** storecraft order id, stored for reference */
  storecraft_order_id: string;
  /** amount in smallest unit */
  amount: number;
  /** iso currency code */
  currency: string;
  /** key_id (public key) sent to frontend for razorpay.js */
  key_id: string;
};