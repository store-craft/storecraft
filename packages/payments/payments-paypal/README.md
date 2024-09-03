# Paypal payment gateway for **StoreCraft**

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%' />
</div><hr/><br/>

[paypal](https://developer.paypal.com/docs/checkout/) integration

## Features
- Create checkouts with `AUTHORIZE` or `CAPTURE` intents
- `capture`, `void`, `refund` actions
- Get a readable and explainable `status`
- Supports both `prod` and `test` endpoints

```bash
npm i @storecraft/payments-paypal
```

## Howto

```js
import { PayPal } from '@storecraft/payments-paypal';

const config = {
  env: 'prod',
  client_id: '<get-from-your-paypal-dashboard>',
  secret: '<get-from-your-paypal-dashboard>',
  currency_code: 'USD',
  intent_on_checkout: 'AUTHORIZE'
}

new Paypal(config);
```

## In Storecraft App

```ts
import { App } from '@storecraft/core';
import { MongoDB } from '@storecraft/database-mongodb';
import { NodePlatform } from '@storecraft/platforms/node';
import { GoogleStorage } from '@storecraft/storage-google';
import { Paypal } from '@storecraft/payments-paypal'

const app = new App(config)
.withPlatform(new NodePlatform())
.withDatabase(new MongoDB())
.withStorage(new GoogleStorage())
.withPaymentGateways(
  {
    'paypal_standard_prod': new Paypal(
      { 
        client_id: process.env.PAYPAL_CLIENT_ID, 
        secret: process.env.PAYPAL_SECRET, 
        env: 'prod' 
      }
    ),
  }
);

await app.init();

```

## Developer info and test

Integration examples
- [https://developer.paypal.com/](https://developer.paypal.com/)

Credit Card Generator
- [https://developer.paypal.com/tools/sandbox/card-testing/#link-creditcardgenerator](https://developer.paypal.com/tools/sandbox/card-testing/#link-creditcardgenerator)

## todo:
- Add tests
- Add webhook support

```text
Author: Tomer Shalev (tomer.shalev@gmail.com)
```