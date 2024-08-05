# Paypal payment gateway for **StoreCraft**

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
const config = {
  env: 'prod',
  client_id: '<get-from-your-paypal-dashboard>',
  secret: '<get-from-your-paypal-dashboard>',
  currency_code: 'USD',
  intent_on_checkout: 'AUTHORIZE'
}

new PaypalStandard(config);
```

## Developer info and test

Integration examples
- https://developer.paypal.com/

Credit Card Generator
- https://developer.paypal.com/tools/sandbox/card-testing/#link-creditcardgenerator

## todo:
- Add tests
- Add webhook support

```text
Author: Tomer Shalev (tomer.shalev@gmail.com)
```