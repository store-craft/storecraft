/**
 * 
 * @description Test with dummy data with this generator 
 * https://developer.paypal.com/tools/sandbox/card-testing/#link-creditcardgenerator.
 * 
 * Or use the following dummy details:
 * - Card number: 4032033785933750
 * - Expiry date: 12/2027
 * - CVC code: 897
 * 
 * @param {import("./types.public.js").Config} config 
 * @param {Partial<import("@storecraft/core/v-api").OrderData>} order_data 
 */
export default function html_buy_ui(config, order_data) {
  const orderData = order_data?.payment_gateway?.on_checkout_create;

  return `
<!DOCTYPE html>
<html style="height: 100%; width: 100%">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width; height=device-height, initial-scale=1.0" />
    <title>PayPal JS SDK Standard Integration</title>
  </head>
  <body style='display: flex; flex-direction: column; justify-content: start; height: 100%; align-items: center;'>
      <div id="paypal-button-container" style='width: 100%' ></div>
      <p id="result-message"></p>
    <!-- Initialize the JS-SDK -->
    <script src="https://www.paypal.com/sdk/js?currency=${config.default_currency_code}&client-id=${config.client_id}&intent=${config.intent_on_checkout.toLowerCase()}"></script>

    <!-- code --> 
    <script>
    const resultMessage = (msg) => {
      document.getElementById('result-message').innerHTML = msg
      console.log(msg);
      
    }

    window.paypal
      .Buttons(
        {
          style: {
            shape: "rect",
            layout: "vertical",
            color: "gold",
            label: "paypal",
            disableMaxWidth: true
          },

          message: {
            amount: ${order_data.pricing.total},
          },

          async createOrder() {
            try {
              if ('${orderData.id}') {
                return '${orderData.id}';
              }
              const errorDetail = ${orderData?.details?.[0]};
              const errorMessage = errorDetail
                ? (errorDetail.issue + errorDetail.description + "(" + '${orderData.debug_id}' + ")")
                : JSON.stringify(orderData);

              throw new Error(errorMessage);
            } catch (error) {
              console.error(error);
              resultMessage("Could not initiate PayPal Checkout...<br><br> " + error);
            }
          },

          async onApprove(data, actions) {
            try {
              const response = await fetch("/api/checkout/${order_data.id}/complete", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
              });

              const orderData_main = await response.json();
              const orderData = orderData_main.payment_gateway.on_checkout_complete;

              // Three cases to handle:
              //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
              //   (2) Other non-recoverable errors -> Show a failure message
              //   (3) Successful transaction -> Show confirmation or thank you message

              const errorDetail = orderData?.details?.[0];

              if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
                // (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
                // recoverable state, per
                // https://developer.paypal.com/docs/checkout/standard/customize/handle-funding-failures/
                return actions.restart();
              } else if (errorDetail) {
                // (2) Other non-recoverable errors -> Show a failure message
                throw new Error(errorDetail.description + "(" + orderData.debug_id + ")");
              } 
              // else if (!orderData.purchase_units) {
              //   throw new Error(JSON.stringify(orderData));
              // } 
              else {
                // (3) Successful transaction -> Show confirmation or thank you message
                // Or go to another URL:  actions.redirect('thank_you.html');
                const transaction =
                  orderData?.purchase_units?.[0]?.payments?.captures?.[0] ||
                  orderData?.purchase_units?.[0]?.payments?.authorizations?.[0];
                resultMessage(
                  "Transaction " + transaction?.status + ":" + transaction?.id + 
                  " See console for all available details"
                );
                console.log(
                  "Capture result",
                  orderData,
                  JSON.stringify(orderData, null, 2)
                );
              }
            } catch (error) {
              console.error(error);
              resultMessage(
                "Sorry, your transaction could not be processed... " + error
              );
            }
          }
            
        }
      ).render("#paypal-button-container"); 

    </script>
    
  </body>
</html>
    `
}
