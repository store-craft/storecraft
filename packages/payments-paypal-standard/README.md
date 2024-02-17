# Paypal Standard payment gateway for **StoreCraft**

[paypal standard](https://developer.paypal.com/docs/checkout/standard/) integration

## Features
- Create checkouts with `AUTHORIZE` or `CAPTURE` intents
- `capture`, `void`, `refund` actions
- Get a readable and explainable `status`
- Supports both `prod` and `test` endpoints

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


## todo:
- Add tests
- Think about adding more dynamic config 

```txt
Author: Tomer Shalev (tomer.shalev@gmail.com)
```