# Taxes

Taxes are hard as they have intrinsic complex rules depending where you are located
as an economic nexus and where you are selling to.

Storeraft make it easy for you to fulfill your complex tax requirements via the
`tax_provider` interface, which we will explore here.

First, le's assume an app,

```ts&lines=6
import { App } from '@storecraft/core'
import { UniformTaxes } from '@storecraft/core/taxes';

const app = new App(config)
.withPlatform(new NodePlatform())
.withTaxes(new UniformTaxes(18))

await app.init();

```

As you can see, each `app` has a `.withTaxes(...)` modifier where you can inject your own
implementation of the following interface

```ts
interface tax_provider {
  compute: (shipping_address: AddressType, pricing: PricingDataWithoutTaxes) => Promise<TaxRecord[]>
}

type TaxRecord = {
  name?: string;
  description?: string;
  value: number;
}

```

You basically receive 
- an almost complete pricing data object, which shows all
the calculation of the line items including shipping and discounts.
- a shipping address

Then, you can launch your complex logic for taxes.

> In the future, we will integrate [TaxJar](https://developers.taxjar.com/) to enhance tax compliance.


## Example

Let's implement a uniform tax provider as implemented in 

```ts
import { UniformTaxes } from `@storecraft/core/tax`
```

And here is the code,

```ts
import type { tax_provider } from '@storecraft/core/tax'

class UniformTaxes implements tax_provider {

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

  async compute (shipping_address: AddressType, pricing: Partial<PricingData>) {
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
```