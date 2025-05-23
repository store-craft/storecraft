/**
 * @import { PROOF_MOCKUP_API_SETUP } from './types.js'
 * @import { 
 *  SendMailParams, SendMailWithTemplateParams 
 * } from '../../api/types.public.js'
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name, assert_async_throws } from '../api/api.utils.js';
import { App } from '../../index.js';
import esMain from '../api/utils.esmain.js';
import { setup_sdk } from './utils.setup-sdk.js';
import { test_setup } from './utils.api-layer.js';
import { admin_email } from '../api/auth.js';

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
      assert.ok(app.isready);
      app.__show_me_everything.rest_controller.logger.active=false;
    }
  );

  s.after(
    async () => { 
      app.__show_me_everything.rest_controller.logger.active=true;
    }
  );

  s('emails', async (ctx) => {
    const user = {
      email: admin_email,
      password: 'admin',
      firstname: 'John',
      lastname: 'Doe',
    }


    /** @type {PROOF_MOCKUP_API_SETUP} */
    const setup = {
      email: {

        sendMail: {
          __tests: [
            () => {

              /** @type {SendMailParams} */
              const mail_object = {
                from: {
                  address: 'test@test.com',
                  name: 'Test'
                },
                html: 'test',
                text: 'test',
                subject: 'test',
                to: [
                  {
                    address: 'recipient@example.com'
                  }
                ]
              }

              return { 
                test: async () => {
                  { // non-secured
                    sdk.config.auth = undefined;
                    await assert_async_throws(
                      () => sdk.emails.send(mail_object),
                      'sendMail is not secured'
                    )
                  }
                  { // secured
                    await sdk.auth.signin(user.email, user.password);
                    const proof = await sdk.emails.send(mail_object);
                    assert.equal(proof, 'proof.emails.sendMail');
                  }
                },
                intercept_backend_api: async (params) => {
                  assert.equal(params, mail_object);
                  return 'proof.emails.sendMail';
                },
              }
            }
          ]
        },        
                 

        sendMailWithTemplate: {
          __tests: [
            () => {

              /** @type {SendMailWithTemplateParams<'my-template'>} */
              const mail_object_with_template = {
                emails: ['test@test.com'],
                template_handle: 'my-template',
                data: {
                  firstname: 'John',
                }
              }

              return { 
                test: async () => {
                  { // non-secured
                    sdk.config.auth = undefined;
                    await assert_async_throws(
                      () => sdk.emails.sendWithTemplate(mail_object_with_template),
                      'sendWithTemplate is not secured'
                    )
                  }
                  { // secured
                    await sdk.auth.signin(user.email, user.password);
                    const proof = await sdk.emails.sendWithTemplate(mail_object_with_template);
                    assert.equal(proof, 'proof.emails.mail_object_with_template');
                  }
                },
                intercept_backend_api: async (params) => {
                  assert.equal(params, mail_object_with_template);
                  return 'proof.emails.mail_object_with_template';
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
    s.after(async () => { await app.__show_me_everything.db.disconnect() });
    s.run();
  } catch (e) {
  }
})();