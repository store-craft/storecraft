/**
 * @import { Config } from './types.public.js'
 * @import { CheckoutCreateResult } from './types.private.js'
 * @import { OrderData } from '@storecraft/core/api'
 */

/**
 * generates the html checkout page using razorpay.js (standard checkout).
 * the page dispatches storecraft events to the parent frame on success or failure,
 * matching the pattern used by the paypal adapter.
 *
 * @param {Config} config
 * @param {Partial<OrderData>} order_data
 * @param {CheckoutCreateResult} checkout_create_result
 * @returns {string} html string
 */
export default function html_buy_ui(config, order_data, checkout_create_result) {
  const currency = checkout_create_result.currency;
  const amount = checkout_create_result.amount;
  const razorpay_order_id = checkout_create_result.razorpay_order_id;
  const key_id = checkout_create_result.key_id;
  const storecraft_order_id = order_data.id;

  return `
<!DOCTYPE html>
<html style="height: 100%; width: 100%">
  <head>
    <meta charset="UTF-8" />
    <meta name="color-scheme" content="light">
    <meta name="viewport" content="width=device-width; height=device-height, initial-scale=1.0" />
    <title>Razorpay Checkout</title>
    <style>
      * { box-sizing: border-box; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 14px;
        width: 100vw;
        max-width: 500px;
        margin: auto;
        padding: 20px;
        -webkit-font-smoothing: antialiased;
        background-color: white;
      }
      #pay-btn {
        background: #528ff0;
        color: #ffffff;
        border: 0;
        border-radius: 4px;
        padding: 12px 16px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        width: 100%;
        transition: background 0.2s ease;
      }
      #pay-btn:hover { background: #3a7bd5; }
      #pay-btn:disabled { background: #aac4f0; cursor: not-allowed; }
      #result-message { margin-top: 12px; font-size: 14px; }
    </style>
  </head>
  <body>
    <div id="razorpay-button-container">
      <button id="pay-btn">Pay ${(amount / 100).toFixed(2)} ${currency}</button>
    </div>
    <p id="result-message"></p>

    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>

    <script>
      const resultMessage = (msg) => {
        document.getElementById('result-message').innerHTML = msg;
      };

      const dispatchStorecraftEvent = (event, data) => {
        window?.parent?.postMessage({ who: 'storecraft', event, data }, '*');
      };

      console.log = function(...args) {
        dispatchStorecraftEvent('storecraft/checkout-log', args);
      };

      console.error = function(...args) {
        dispatchStorecraftEvent('storecraft/checkout-error', args);
      };

      document.getElementById('pay-btn').addEventListener('click', function () {
        const options = {
          key: '${key_id}',
          amount: '${amount}',
          currency: '${currency}',
          order_id: '${razorpay_order_id}',
          name: 'StoreCraft',
          description: 'Order #${storecraft_order_id}',
          handler: async function (razorpay_response) {
            try {
              document.getElementById('pay-btn').disabled = true;
              const response = await fetch(
                window.location.origin + '/api/checkout/${storecraft_order_id}/complete',
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    razorpay_payment_id: razorpay_response.razorpay_payment_id,
                    razorpay_order_id: razorpay_response.razorpay_order_id,
                    razorpay_signature: razorpay_response.razorpay_signature,
                  }),
                }
              );

              if (response.ok) {
                resultMessage('Payment successful! Thank you for your order.');
                dispatchStorecraftEvent('storecraft/checkout-complete', {
                  order_id: '${storecraft_order_id}',
                  payment_gateway: 'razorpay',
                  razorpay_payment_id: razorpay_response.razorpay_payment_id,
                });
              } else {
                const err = await response.text();
                resultMessage('Payment verification failed: ' + err);
                dispatchStorecraftEvent('storecraft/checkout-error', {
                  order_id: '${storecraft_order_id}',
                  error: err,
                });
              }
            } catch (error) {
              console.error(error.message);
              resultMessage('Something went wrong: ' + error.message);
            } finally {
              document.getElementById('pay-btn').disabled = false;
            }
          },
          modal: {
            ondismiss: function () {
              resultMessage('Payment window closed. Click the button to try again.');
              dispatchStorecraftEvent('storecraft/checkout-dismissed', {
                order_id: '${storecraft_order_id}',
              });
            },
          },
          theme: { color: '#528ff0' },
        };

        const rzp = new Razorpay(options);
        rzp.on('payment.failed', function (response) {
          const msg = response.error.description;
          resultMessage('Payment failed: ' + msg);
          console.error('razorpay payment failed', response.error);
          dispatchStorecraftEvent('storecraft/checkout-error', {
            order_id: '${storecraft_order_id}',
            error: msg,
          });
        });
        rzp.open();
      });
    </script>
  </body>
</html>
  `;
}