
export type DummyPaymentData = {
  status: 'created' | 'authorized' | 'captured' | 'voided' | 'refunded' | 'unknown',
  id: string,
  metadata: {
    // id of storecraft order
    // will be used by webhook to identify the order
    external_order_id: string
  },
  created_at: string,
  price: number,
  currency: string,
}