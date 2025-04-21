import { StorecraftSDK } from '@storecraft/sdk';
import { App } from '../../index.js'
/**
 * @param {App} app `storecraft` app instance
 */
export const setup_sdk = (app) => {
  
  const sdk = new StorecraftSDK(
    {
      endpoint: 'http://localhost'
    },
    (input, init) => {
      return app.rest_controller.handler(
        new Request(input, init),
      )
    }
  );

  return sdk;
}
