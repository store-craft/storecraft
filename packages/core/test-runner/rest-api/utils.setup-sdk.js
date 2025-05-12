import { StorecraftSDK } from '@storecraft/sdk';
import { App } from '../../index.js';

/**
 * @description Setup the SDK for the `storecraft` app,
 * by redirecting it's HTTP requests straight into the app's
 * REST controller.
 * @param {App} app `storecraft` app instance
 */
export const setup_sdk = (app) => {
  
  const sdk = new StorecraftSDK(
    {
      endpoint: 'http://localhost'
    },
    (input, init) => {
      return app.__show_me_everything.rest_controller.handler(
        new Request(input, init),
      )
    }
  );

  return sdk;
}
