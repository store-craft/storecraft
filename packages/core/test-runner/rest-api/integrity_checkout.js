/**
 * @import { CheckoutCreateType, OrderData,
 * } from '../../api/types.api.js'
 * @import { PROOF_MOCKUP_API_SETUP } from './types.js'
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name } from '../api/api.utils.js';
import { 
  App, CheckoutStatusEnum, 
  FulfillOptionsEnum, PaymentOptionsEnum 
} from '../../index.js';
import esMain from '../api/utils.esmain.js';
import { setup_sdk } from './utils.setup-sdk.js';
import { test_setup } from './utils.api-layer.js';
import { admin_email } from '../api/auth.js';
import { 
  api_query_to_searchparams, parse_query 
} from '../../api/query.js';
import { ID } from '../../api/utils.func.js';

/**
 * @param {App} app `storecraft` app instance
 */
export const create = (app) => {
  const sdk = setup_sdk(app);
  const s = suite(
    file_name(import.meta.url), 
    {}
  );

  s.before(
    async () => { 
      await app.init();
      assert.ok(app.ready);
      app.rest_controller.logger.active=false;
    }
  );

  s.after(
    async () => { 
      app.rest_controller.logger.active=true;
    }
  );

  s('checkout', async (ctx) => {
    const user = {
      email: admin_email,
      password: 'admin',
      firstname: 'John',
      lastname: 'Doe',
    }

    const legit_query = parse_query(
      api_query_to_searchparams({
        limit: 10,
        order: 'desc',
        vql_as_string: 'active:true'
      })
    );

    /** @type {CheckoutCreateType} */
    const checkout_item = {
      line_items: [],
      shipping_method: {
        handle: 'ship_test',
      },
      contact: {
        email: 'a1@a.com'
      }
    }

    /** @type {OrderData} */
    const order_item = {
      id: ID('order'),
      line_items: [],
      pricing: {
        quantity_discounted: 0,
        quantity_total: 0,
        total: 0,
        subtotal: 0,
        subtotal_discount: 0,
        subtotal_undiscounted: 0
      },
      shipping_method: {
        handle: 'test',
        id: 'test',
        price: 0,
        title: 'test',
      },
      status: {
        checkout: CheckoutStatusEnum.unknown,
        payment: PaymentOptionsEnum.unpaid,
        fulfillment: FulfillOptionsEnum.draft
      }
    }

    /** @type {PROOF_MOCKUP_API_SETUP} */
    const setup = {
      checkout: {

        create_checkout: {
          __tests: [
            { 
              test: async () => {
                { // non-secured
                  sdk.config.auth = undefined;
                  const proof = await sdk.checkout.create(
                    checkout_item, 'dummy'
                  );
                  assert.equal(proof, 'proof.checkout.create_checkout');
                }
              },
              intercept_backend_api: async (checkout, gateway_handle) => {
                assert.equal(gateway_handle, 'dummy');
                assert.equal(checkout, checkout_item);
                return 'proof.checkout.create_checkout';
              },
            },

          ]
        },        
                 

        complete_checkout: {
          __tests: [
            { // asert secured endpoint
              test: async () => {
                { // non-secured
                  sdk.config.auth = undefined;
                  const proof = await sdk.checkout.complete('order_fake_id');
                  assert.equal(proof, 'proof.checkout.complete_checkout');
                }
              },
              intercept_backend_api: async (checkout_id) => {
                assert.equal(checkout_id, 'order_fake_id');
                return 'proof.checkout.complete_checkout';
              },
            }
          ]
        },               
        

        eval_pricing: {
          __tests: [
            () => {
              let has_run = false;
              return { 
                test: async () => {
                  { // non-secured
                    sdk.config.auth = undefined;
                    try {
                      await sdk.checkout.pricing(order_item)
                    } catch(e) {}
                    assert.ok(has_run, 'eval_pricing did not run');
                  }
                },
                intercept_backend_api: async (params) => {
                  assert.equal(params, order_item);
                  has_run=true;
                },
              }
            }
          ]
        },    
        
      }    

    }

    await test_setup(app, setup);

  });  

  return s;
}


(async function inner_test() {
  // helpful for direct inner tests
  if(!esMain(import.meta)) return;
  try {
    const { create_app } = await import('../../app.test.fixture.js');
    const app = await create_app(false);
    const s = create(app);
    s.after(async () => { await app.db.disconnect() });
    s.run();
  } catch (e) {
  }
})();