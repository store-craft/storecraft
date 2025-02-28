
export type DummyPaymentData = {
  status: 'created' | 'authorized' | 'captured' | 'voided' | 'refunded' | 'unknown',
  id: string,
  created_at: string,
  price: number,
  currency: string,
}