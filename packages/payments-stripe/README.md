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

  // (Optional) `stripe` private `webhook` secret
  webhook_endpoint_secret: 'whsec_.....',
  
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
    payment_method_options: {
      card: {
        // authorize and capture flow
        capture_method: 'manual',
      },
    },
  }  
}

new Stripe(config);
```

## Developer info and test

First, some resources from `stripe`

- [Authorize and Capture Flow](https://docs.stripe.com/payments/place-a-hold-on-a-payment-method)
- [Webhooks](https://docs.stripe.com/webhooks)
- [Credit Card Generator](https://developer.paypal.com/tools/sandbox/card-testing/#link-creditcardgenerator)

## Test Webhooks
First, consult [Stripe Webhooks Docs](https://docs.stripe.com/webhooks)
Then, Install the `stripe` cli.

```bash
stripe listen --skip-verify --forward-to localhost:8000/api/payments/gateways/stripe/webhook
```

This will print the `webhook` **SECRET**

```bash
Ready! Your webhook signing secret is '{{WEBHOOK_SIGNING_SECRET}}' (^C to quit)
```

Copy the `WEBHOOK_SIGNING_SECRET` and put it in the `config` of the gateway.

Now, start interacting, and test some payments.


## todo:
- Add tests


```text
Author: Tomer Shalev (tomer.shalev@gmail.com)
```