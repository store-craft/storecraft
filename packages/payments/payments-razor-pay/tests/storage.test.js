import "dotenv/config";
import { test } from "uvu";
import * as assert from "uvu/assert";

/**
 * razorpay gateway tests.
 *
 * to run the full checkout lifecycle test against razorpay test mode,
 * duplicate packages/core/app.test.fixture.js into this tests/ folder,
 * replace DummyPayments with Razorpay, and run node on app.test.js.
 *
 * the maintainer confirmed in the issue thread that gateway tests run
 * locally with real sandbox accounts and are not committed to ci.
 * only the dummy payments gateway is tested in ci.
 *
 * how to get test keys:
 *   1. go to https://dashboard.razorpay.com/app/keys
 *   2. make sure the toggle at the top right says "test mode"
 *   3. generate key id and key secret
 *   4. put them in packages/payments/payments-razorpay/tests/.env:
 *        RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
 *        RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
 *
 * test card numbers for razorpay test mode:
 *   visa (indian):        4100 2800 0000 1007  cvv: any  expiry: any future date
 *   mastercard (indian):  5500 6700 0000 1002  cvv: any  expiry: any future date
 *   visa (international): 4012 8888 8888 1881  cvv: any  expiry: any future date
 *   full list at https://razorpay.com/docs/payments/payments/test-card-details/
 *
 * to run (from this package root):
 *   npx uvu tests storage.test.js
 */

test("todo", async () => {
  assert.ok(true, "todo");
});

test.run();
