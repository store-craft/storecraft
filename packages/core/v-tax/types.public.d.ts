import type { 
  AddressType, OrderData, PricingData, TaxRecord 
} from "../v-api/types.api.d.ts";
import type { App } from '../types.public.d.ts';
export { UniformTaxes } from './public.js';

export type PricingDataWithoutTaxes = Partial<Omit<PricingData, 'taxes' | 'total'>>;

/**
 * @description Basic tax provider interface
 */
export declare interface tax_provider {

  /**
   * @description compute the `taxes` given pricing and shipping address
   * @param shipping_address `shipping` address
   * @param pricing `pricing` data
   */
  compute: (shipping_address: AddressType, pricing: PricingDataWithoutTaxes) => Promise<TaxRecord[]>
}
