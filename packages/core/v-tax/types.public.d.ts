import type { OrderData, PricingData, TaxRecord } from "../v-api/types.api.d.ts";
import type { App } from '../types.public.d.ts'

/**
 * @description Basic tax provider interface
 */
export declare interface tax_provider {

  /**
   * @description compute the `taxes` given a checkout order
   * @param pricing `pricing` data
   */
  compute: (pricing: Partial<Omit<PricingData, 'taxes' | 'total'>>) => Promise<TaxRecord[]>
}
