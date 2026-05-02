# Razorpay payment gateway for **StoreCraft**

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' width='90%' />
</div><hr/><br/>

[Razorpay](https://razorpay.com) payment gateway integration for StoreCraft.
Razorpay is the dominant payment gateway in India and South Asia, supporting
UPI, Netbanking, Cards, and Wallets.

## Features

- Create checkouts (Razorpay order creation)
- `capture`, `refund` actions
- Synchronous payment completion with signature verification
- Webhook support for async payment events
- Buy link HTML with Razorpay Standard Checkout UI
- Supports both `manual` and `automatic` capture modes

## Install
```bash
npm i @storecraft/payments-razorpay
```

## Configuration
```js
import { Razorpay } from '@storecraft/payments-razorpay';

const gateway = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
  default_currency_code: 'INR',
  capture_mode: 'manual',
});
```

If `key_id` and `key_secret` are not passed in config, they are read
automatically from env variables `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.

## In StoreCraft App
```js
import { App } from '@storecraft/core';
import { NodePlatform } from '@storecraft/core/platform/node';
import { MongoDB } from '@storecraft/database-mongodb';
import { Razorpay } from '@storecraft/payments-razorpay';

const app = new App(config)
  .withPlatform(new NodePlatform())
  .withDatabase(new MongoDB())
  .withPaymentGateways({
    razorpay: new Razorpay(),
  })
  .init();
```

## Webhook setup

1. go to your razorpay dashboard -> settings -> webhooks
2. set the webhook url to `https://your-domain.com/api/gateways/razorpay/webhook`
3. select events: `payment.authorized`, `payment.captured`, `payment.failed`, `refund.processed`
4. copy the webhook secret and set it as env variable `RAZORPAY_WEBHOOK_SECRET`

the gateway handles these four events. all other events are ignored and return
`null` so storecraft takes no action.

## Testing

get test api keys from https://dashboard.razorpay.com/app/keys (switch to test mode).

test card numbers (from https://razorpay.com/docs/payments/payments/test-card-details/):

| card network | number              | cvv   | expiry     |
|--------------|---------------------|-------|------------|
| visa         | 4111 1111 1111 1111 | any 3 | any future |
| mastercard   | 5267 3181 8797 5449 | any 3 | any future |

create `tests/.env` with your test credentials:
```
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
```

to run the unit tests:
```bash
cd packages/payments/payments-razorpay
npm test
```

to run the full integration test against razorpay test mode:
```bash
cd packages/payments/payments-razorpay
node --env-file=tests/.env tests/app.test.local.js
```

Author: nischaldoescode