/**
 * @import { tax_provider } from "./types.public.d.ts"
 */


/** 
 * @description super simple uniform tax calculator, this is useless if you
 * are selling to various states. 
 * 
 * @implements {tax_provider}
 */
export class UniformTaxes {

  #percents = 0;
  #name = 'vat';

  /**
   * 
   * @param {number} percents a number between 0 and 100
   * @param {*} name name of the tax, defaults to 'vat'
   */
  constructor(percents = 0.0, name = 'vat') {
    this.#percents = percents;
    this.#name = name;
  }

  get name() {
    return this.#name;
  }

  get percents() {
    return this.#percents;
  }

  /**
   * @type {tax_provider["compute"]}
   */
  async compute (shipping_address, pricing) {
    const value = parseFloat(
      ((pricing.total_without_taxes * this.#percents) / 100.0).toFixed(2)
    );

    return [
      {
        value,
        name: this.name,
        description: `${this.percents}% VAT Taxes`
      }
    ]
  }
}