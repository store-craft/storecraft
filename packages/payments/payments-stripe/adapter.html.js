/**
 * @import { Config } from './types.public.js'
 * @import { OrderData } from '@storecraft/core/api'
 */

/**
 * 
 * @description Official `Stripe` UI integration with `storecraft`.
 * 
 * Test with dummy data with this generator 
 * https://docs.stripe.com/payments/quickstart
 * 
 * Or use the following dummy details:
 * https://docs.stripe.com/testing?testing-method=card-numbers
 * - Card number: 4242424242424242
 * - Expiry date:   
 * - CVC code: 897
 * 
 * @param {Config} config 
 * @param {Partial<OrderData>} order_data 
 */
export default function html_buy_ui(config, order_data) {

  /** @type {import("./adapter.js").CheckoutCreateResult} */
  const on_checkout_create = order_data?.payment_gateway?.on_checkout_create;
  
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Accept a payment</title>
    <meta name="description" content="A demo of a payment on Stripe" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://js.stripe.com/v3/"></script>

    <script defer>
      // This is your test publishable API key.
      const stripe = new Stripe("${config.publishable_key}");
      const dispatchEvent = (event, data) => {
        window?.parent?.postMessage(
          {
            who: "storecraft",
            event,
            data
          },
          "*"
        );
      }
      // Override console.log to send messages to the parent window
      console.log = function(...args) {
        // Log to console
        dispatchEvent(
          "storecraft/checkout-log",
          args
        );
      };

      console.error = function(...args) {
        // Log to console
        dispatchEvent(
          "storecraft/checkout-error",
          args
        );
      };
              
      let elements;

      window.onload = function() {
        initialize();
        checkStatus();
  
        document
        .getElementById("payment-form")
        .addEventListener("submit", handleSubmit);
      }

      // Fetches a payment intent and captures the client secret
      async function initialize() {
        const clientSecret = "${on_checkout_create.client_secret}";

        const appearance = {
          theme: 'stripe',
        };
        elements = stripe.elements({ appearance, clientSecret });

        const paymentElementOptions = {
          layout: "tabs",
        };

        const paymentElement = elements.create("payment", paymentElementOptions);
        paymentElement.mount("#payment-element");
      }

      async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        const { error } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            // return to this same page, which can also interpret the
            // payment intent status from the URL parameters
            return_url: window.location.href,
          },
          redirect: 'if_required'
        });

        // This point will only be reached if there is an immediate error when
        // confirming the payment. Otherwise, your customer will be redirected to
        // your \`return_url\` unless 'if_required' ise set. For some payment methods like iDEAL, your customer will
        // be redirected to an intermediate site first to authorize the payment, then
        // redirected to the \`return_url\`.
        if(error) {
          dispatchEvent("storecraft/checkout-error", {
            order_id: "${order_data.id}"
          }); 

          if (error.type === "card_error" || error.type === "validation_error") {
            showMessage(error.message);
          } else if(error) {
            showMessage("An unexpected error occurred.");
          }
        } else {
          // if 'if_required' is set and no redirect is needed,
          // Payment succeeded, you can show a success message to your customer
          dispatchEvent("storecraft/checkout-complete", {
            order_id: "${order_data.id}"
          }); 
        }

        setLoading(false);
      }

      // Fetches the payment intent status after payment submission
      async function checkStatus() {
        const clientSecret = new URLSearchParams(window.location.search).get(
          "payment_intent_client_secret"
        );

        if (!clientSecret) {
          return;
        }

        const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

        switch (paymentIntent.status) {
          case "succeeded":
            showMessage("Payment succeeded!");
            dispatchEvent("storecraft/checkout-complete", {
              order_id: "${order_data.id}"
            }); 

            break;
          case "processing":
            showMessage("Your payment is processing.");
            break;
          case "requires_payment_method":
            showMessage("Your payment was not successful, please try again.");
            break;
          default:
            showMessage("Something went wrong.");
            dispatchEvent("storecraft/checkout-error", {
              order_id: "${order_data.id}"
            }); 
            break;
        }
      }

      // ------- UI helpers -------

      function showMessage(messageText) {
        const messageContainer = document.querySelector("#payment-message");

        messageContainer.classList.remove("hidden");
        messageContainer.textContent = messageText;

        console.log(messageText);

        setTimeout(function () {
          messageContainer.classList.add("hidden");
          messageContainer.textContent = "";
        }, 4000);
      }

      // Show a spinner on payment submission
      function setLoading(isLoading) {
        if (isLoading) {
          // Disable the button and show a spinner
          document.querySelector("#submit").disabled = true;
          document.querySelector("#spinner").classList.remove("hidden");
          document.querySelector("#button-text").classList.add("hidden");
        } else {
          document.querySelector("#submit").disabled = false;
          document.querySelector("#spinner").classList.add("hidden");
          document.querySelector("#button-text").classList.remove("hidden");
        }
      }

    </script>

    <style>
      /* Variables */
      * { 
        box-sizing: border-box;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 10px;
        -webkit-font-smoothing: antialiased;
        height: content;
        background-color: white;
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;
      }

      form {
        width: 100%;
        max-width: 500px;
        mmmin-width: 500px;
        align-self: center;
      }

      .hidden {
        display: none;
      }

      #payment-message {
        color: rgb(105, 115, 134);
        font-size: 16px;
        line-height: 20px;
        padding-top: 12px;
        text-align: center;
      }

      #payment-element {
        margin-bottom: 24px;
      }

      /* Buttons and links */
      button {
        background: #5469d4;
        font-family: Arial, sans-serif;
        color: #ffffff;
        border-radius: 4px;
        border: 0;
        padding: 12px 16px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        display: block;
        transition: all 0.2s ease;
        box-shadow: 0px 4px 5.5px 0px rgba(0, 0, 0, 0.07);
        width: 100%;
      }
      button:hover {
        filter: contrast(115%);
      }
      button:disabled {
        opacity: 0.5;
        cursor: default;
      }

      /* spinner/processing state, errors */
      .spinner,
      .spinner:before,
      .spinner:after {
        border-radius: 50%;
      }
      .spinner {
        color: #ffffff;
        font-size: 22px;
        text-indent: -99999px;
        margin: 0px auto;
        position: relative;
        width: 20px;
        height: 20px;
        box-shadow: inset 0 0 0 2px;
        -webkit-transform: translateZ(0);
        -ms-transform: translateZ(0);
        transform: translateZ(0);
      }
      .spinner:before,
      .spinner:after {
        position: absolute;
        content: "";
      }
      .spinner:before {
        width: 10.4px;
        height: 20.4px;
        background: #5469d4;
        border-radius: 20.4px 0 0 20.4px;
        top: -0.2px;
        left: -0.2px;
        -webkit-transform-origin: 10.4px 10.2px;
        transform-origin: 10.4px 10.2px;
        -webkit-animation: loading 2s infinite ease 1.5s;
        animation: loading 2s infinite ease 1.5s;
      }
      .spinner:after {
        width: 10.4px;
        height: 10.2px;
        background: #5469d4;
        border-radius: 0 10.2px 10.2px 0;
        top: -0.1px;
        left: 10.2px;
        -webkit-transform-origin: 0px 10.2px;
        transform-origin: 0px 10.2px;
        -webkit-animation: loading 2s infinite ease;
        animation: loading 2s infinite ease;
      }

      @-webkit-keyframes loading {
        0% {
          -webkit-transform: rotate(0deg);
          transform: rotate(0deg);
        }
        100% {
          -webkit-transform: rotate(360deg);
          transform: rotate(360deg);
        }
      }
      @keyframes loading {
        0% {
          -webkit-transform: rotate(0deg);
          transform: rotate(0deg);
        }
        100% {
          -webkit-transform: rotate(360deg);
          transform: rotate(360deg);
        }
      }


    </style>
  </head>

  <body>
    <!-- Display a payment form -->
    <form id="payment-form">
      <div id="payment-element">
        <!--Stripe.js injects the Payment Element-->
      </div>
      <button id="submit">
        <div class="spinner hidden" id="spinner"></div>
        <span id="button-text">Pay now</span>
      </button>
      <div id="payment-message" class="hidden"></div>
    </form>
  </body>

</html>
    `
}
