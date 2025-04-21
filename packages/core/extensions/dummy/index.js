/**
 * @import { extension } from '../types.public.js';
 */

/**
 * Dummy extension for testing purposes. Has two actions:
 * - `ping`: returns `pong`
 * - `echo`: returns the payload it receives
 * @implements {extension<unknown>}
 */
export class DummyExtension {

  get config() {
    return undefined;
  }

  /** @type {extension["actions"]} */
  get actions() {
    return [
      {
        handle: 'ping',
        name: 'Ping',
        description: 'Ping for testing, returns `pong`'
      },
      {
        handle: 'echo',
        name: 'Echo',
        description: 'Echo for testing, everything you send will be returned'
      }
    ];
  }

  /** @type {extension["info"]} */
  get info() {
    return {
      name: 'Dummy Extension',
      description: 'This extension is dummy with ping action',
    }
  }

  /** @type {extension["onInit"]} */
  onInit(app) {
  }

  /** @type {extension["invokeAction"]} */
  invokeAction(action_handle) {
    switch (action_handle) {
      case 'echo':
        return async (payload) => {
          return payload;
        };
      case 'ping':
        return async (payload) => {
          return 'pong';
        };
      default:
        throw new Error(`Action ${action_handle} not found`);
    }
  }

}
