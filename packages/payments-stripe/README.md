# Stripe payment gateway for **StoreCraft**

[Stripe](https://docs.stripe.com/payments/place-a-hold-on-a-payment-method) integration


```bash
npm i @storecraft/payments-stripe
```

## Howto

```js
import { Stripe } from '@storecraft/payments-stripe';
import { Stripe as StripeCls } from 'stripe';

const config = {
  //`stripe` publishable key
  publishable_key: 'pk_....',

  // `stripe` private secret
  secret: 'sk_.....',
  
  // config options for `stripe`
  stripe_config: {
    httpClient: StripeCls.createFetchHttpClient()
  },

  // configure `intent` creation
  stripe_intent_create_params: {
    currency: 'usd', 
    automatic_payment_methods: {
      enabled: true,
    },
    confirmation_method: 'manual',
    payment_method_options: {
      card: {
        capture_method: 'manual',
      },
    },
  }  
}

new Stripe(config);
```

## Developer info and test

Integration examples
- https://docs.stripe.com/payments/place-a-hold-on-a-payment-method

Credit Card Generator
- https://developer.paypal.com/tools/sandbox/card-testing/#link-creditcardgenerator

## todo:
- Add tests


```text
Author: Tomer Shalev (tomer.shalev@gmail.com)
```