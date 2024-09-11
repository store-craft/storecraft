

/**
 * 
 * @typedef {import("./types.public.d.ts").tax_provider} tax_provider
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
    const value = (pricing.total_without_taxes * this.#percents) / 100.0;

    return [
      {
        value,
        name: this.name,
        description: `${this.percents}% VAT Taxes`
      }
    ]
  }
}